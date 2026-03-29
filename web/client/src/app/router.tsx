import { ProductShell } from "@/components/product/ProductShell";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { PlazaPage } from "@/pages/PlazaPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { WishComposePage } from "@/pages/WishComposePage";
import { MyWishesPage } from "@/pages/MyWishesPage";
import { Redirect, Route, Switch } from "wouter";

export function AppRouter() {
  return (
    <ProductShell>
      <Switch>
        <Route path="/plaza" component={PlazaPage} />
        <Route path="/wish/new" component={WishComposePage} />
        <Route path="/wishes" component={MyWishesPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/me" component={ProfilePage} />
        <Route>
          <Redirect to="/plaza" />
        </Route>
      </Switch>
    </ProductShell>
  );
}
