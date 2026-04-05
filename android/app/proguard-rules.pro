# Task 4 only scaffolds the Android project. Keep release rules minimal until
# feature modules and third-party SDKs are introduced.

# Keep data classes for serialization
-keep @kotlinx.serialization.Serializable class ** {
    *;
}

# Keep update related classes
-keep class com.wishpool.app.domain.model.** { *; }
-keep class com.wishpool.app.core.update.** { *; }

# OkHttp specific rules
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }

# Sherpa ONNX JNI reflects into Kotlin config/data classes by field name.
# Release obfuscation breaks native field lookup (for example decodingMethod).
-keep class com.k2fsa.sherpa.onnx.** { *; }

# Kotlinx serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keep,includedescriptorclasses class com.wishpool.app.**$$serializer { *; }
-keepclassmembers class com.wishpool.app.** {
    *** Companion;
}
-keepclasseswithmembers class com.wishpool.app.** {
    kotlinx.serialization.KSerializer serializer(...);
}
