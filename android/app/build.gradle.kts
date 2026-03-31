import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization") version "2.0.21"
}

// Load keystore properties
val keystorePropertiesFile = rootProject.file("app/keystore.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(keystorePropertiesFile.inputStream())
}

// Improved versionCode calculation to handle semver properly
fun calculateVersionCode(versionName: String): Int {
    val regex = Regex("(\\d+)\\.(\\d+)\\.(\\d+)")
    val match = regex.find(versionName)
    if (match != null) {
        val (major, minor, patch) = match.destructured
        // Use larger multipliers to ensure 0.10.0 > 0.4.0
        // Format: MMMMMMNNNNPP (major * 1000000 + minor * 1000 + patch)
        return major.toInt() * 1000000 + minor.toInt() * 1000 + patch.toInt()
    }
    return 1 // fallback for invalid version format
}

val appVersionName = "0.4.5"
val appVersionCode = calculateVersionCode(appVersionName)

android {
    namespace = "com.wishpool.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.wishpool.app"
        minSdk = 28
        targetSdk = 35
        versionCode = appVersionCode
        versionName = appVersionName

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // BuildConfig fields for update feature
        buildConfigField("String", "VERSION_CHECK_URL", "\"https://api.github.com/repos/Johnson-Ding/Wishpool/releases/latest\"")
    }

    signingConfigs {
        create("release") {
            if (keystorePropertiesFile.exists()) {
                // Local development: use keystore.properties
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
            } else {
                // CI environment: use environment variables
                System.getenv("KEYSTORE_FILE")?.let { storeFile = file(it) }
                System.getenv("KEYSTORE_PASSWORD")?.let { storePassword = it }
                System.getenv("KEY_ALIAS")?.let { keyAlias = it }
                System.getenv("KEY_PASSWORD")?.let { keyPassword = it }
            }
        }
    }

    buildTypes {
        debug {
            // No suffix: same packageName as release, can be overwrite-installed
            isDebuggable = true
            signingConfig = signingConfigs.getByName("release")
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            isDebuggable = false
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    val bom = platform("androidx.compose:compose-bom:2024.12.01")

    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.10.0")
    implementation("androidx.navigation:navigation-compose:2.8.5")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("com.google.android.material:material:1.12.0")

    implementation(bom)
    androidTestImplementation(bom)

    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Networking for auto-update
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    // Permission handling
    implementation("com.google.accompanist:accompanist-permissions:0.34.0")
    implementation(files("libs/sherpa-onnx-1.12.23.aar"))

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
