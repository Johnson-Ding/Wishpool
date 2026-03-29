import Foundation
import Observation
import WishpoolCore

@MainActor
@Observable
final class WishpoolAppModel {
    var selectedTab: AppTab = .feed
    var presentedSheet: AppSheet?

    var feedState: Loadable<[FeedItem]> = .idle
    var wishesState: Loadable<[WishTask]> = .idle
    var roundsState: Loadable<[ValidationRound]> = .idle
    var commentsState: Loadable<[FeedComment]> = .idle

    var selectedWish: WishTask?
    var actionMessage: String?

    private let repository: any WishpoolRepository

    init(repository: any WishpoolRepository) {
        self.repository = repository
    }

    func bootstrap() async {
        await withTaskGroup(of: Void.self) { group in
            group.addTask { await self.loadFeed() }
            group.addTask { await self.loadWishes() }
        }
    }

    func loadFeed() async {
        if case .loaded = feedState { return }
        feedState = .loading
        do {
            let items = try await repository.listFeed(limit: 24)
            feedState = .loaded(items)
        } catch {
            feedState = .failed(error.localizedDescription)
        }
    }

    func loadWishes() async {
        wishesState = .loading
        do {
            let wishes = try await repository.listMyWishes()
            wishesState = .loaded(wishes)
        } catch {
            wishesState = .failed(error.localizedDescription)
        }
    }

    func likeFeed(id: Int) async {
        do {
            let updated = try await repository.likeFeedItem(id: id)
            if case let .loaded(items) = feedState {
                feedState = .loaded(items.map { $0.id == id ? updated : $0 })
            }
            actionMessage = "已点赞"
        } catch {
            actionMessage = error.localizedDescription
        }
    }

    func openComments(for bottleID: Int) async {
        presentedSheet = .comments(bottleID)
        commentsState = .loading
        do {
            let comments = try await repository.listComments(bottleID: bottleID)
            commentsState = .loaded(comments)
        } catch {
            commentsState = .failed(error.localizedDescription)
        }
    }

    func submitComment(for bottleID: Int, content: String) async {
        do {
            _ = try await repository.createComment(bottleID: bottleID, content: content, authorName: nil)
            let comments = try await repository.listComments(bottleID: bottleID)
            commentsState = .loaded(comments)
            actionMessage = "评论已发送"
        } catch {
            actionMessage = error.localizedDescription
        }
    }

    func openCreateWish() {
        presentedSheet = .createWish
    }

    func openDirectWish() {
        presentedSheet = .createWishDirect
    }

    func openAiPlan(wishInput: String) {
        presentedSheet = .aiPlan(wishInput: wishInput)
    }

    /// 语音直发后，自动进入 AI 方案页面
    func handleDirectWishSubmit(text: String) async {
        presentedSheet = .aiPlan(wishInput: text)
    }

    func createWish(intent: String, city: String, budget: String, timeWindow: String) async {
        do {
            let wish = try await repository.createWish(
                WishDraft(
                    intent: intent,
                    city: city.nilIfBlank,
                    budget: budget.nilIfBlank,
                    timeWindow: timeWindow.nilIfBlank,
                    rawInput: intent
                )
            )
            await loadWishes()
            selectedWish = wish
            roundsState = .loaded([])
            presentedSheet = .wishDetail(wish.id)
            actionMessage = "愿望已记录"
        } catch {
            actionMessage = error.localizedDescription
        }
    }

    func openWish(_ wish: WishTask) async {
        selectedWish = wish
        presentedSheet = .wishDetail(wish.id)
        roundsState = .loading

        async let latestWish = repository.getWish(id: wish.id)
        async let rounds = repository.listRounds(wishID: wish.id)

        do {
            selectedWish = try await latestWish
            roundsState = .loaded(try await rounds)
        } catch {
            roundsState = .failed(error.localizedDescription)
        }
    }

    func clarifySelectedWish(intent: String, city: String, budget: String, timeWindow: String) async {
        guard let selectedWish else { return }
        do {
            let updated = try await repository.clarifyWish(
                id: selectedWish.id,
                draft: WishDraft(
                    title: selectedWish.title,
                    intent: intent,
                    city: city.nilIfBlank,
                    budget: budget.nilIfBlank,
                    timeWindow: timeWindow.nilIfBlank,
                    rawInput: intent
                )
            )
            self.selectedWish = updated
            roundsState = .loaded(try await repository.listRounds(wishID: updated.id))
            await loadWishes()
            actionMessage = "澄清信息已更新"
        } catch {
            actionMessage = error.localizedDescription
        }
    }

    func confirmSelectedWish() async {
        guard let selectedWish else { return }
        do {
            let updated = try await repository.confirmWishPlan(id: selectedWish.id)
            self.selectedWish = updated
            await loadWishes()
            actionMessage = "方案已确认"
        } catch {
            actionMessage = error.localizedDescription
        }
    }

    func dismissSheet() {
        presentedSheet = nil
    }

    func consumeActionMessage() {
        actionMessage = nil
    }
}

enum WishpoolBootstrap {
    @MainActor
    static func makeRepository() -> any WishpoolRepository {
        let fallback = MockWishpoolRepository()
        let environment = ProcessInfo.processInfo.environment

        let urlString = environment["WISHPOOL_SUPABASE_URL"] ?? "https://hfwqkeycrxbmeinyrkdh.supabase.co"
        let anonKey = environment["WISHPOOL_SUPABASE_ANON_KEY"] ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd3FrZXljcnhibWVpbnlya2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY2MTUsImV4cCI6MjA5MDE1MjYxNX0.G3ohFCS7gYVHjGxe-v4UkIXlFEsOcd5HTL0_dKRSNT0"
        guard let url = URL(string: urlString) else {
            return fallback
        }

        let deviceID = UserDefaults.standard.string(forKey: "wishpool_device_id") ?? {
            let generated = UUID().uuidString
            UserDefaults.standard.set(generated, forKey: "wishpool_device_id")
            return generated
        }()

        let primary = SupabaseWishpoolRepository(
            config: SupabaseConfig(
                projectURL: url,
                anonKey: anonKey,
                deviceID: deviceID
            )
        )

        return FallbackWishpoolRepository(primary: primary, fallback: fallback)
    }
}

private extension String {
    var nilIfBlank: String? {
        trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : self
    }
}
