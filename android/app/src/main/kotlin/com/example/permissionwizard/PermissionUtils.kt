package com.example.permissionwizard

import android.app.AppOpsManager
import android.app.NotificationManager
import android.app.usage.UsageStatsManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat

object PermissionUtils {

    fun hasCameraPermission(context: Context): Boolean {
        return ContextCompat.checkSelfPermission(context, android.Manifest.permission.CAMERA) == android.content.pm.PackageManager.PERMISSION_GRANTED
    }

    fun hasMicrophonePermission(context: Context): Boolean {
        return ContextCompat.checkSelfPermission(context, android.Manifest.permission.RECORD_AUDIO) == android.content.pm.PackageManager.PERMISSION_GRANTED
    }

    fun hasFineLocation(context: Context): Boolean {
        return ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED
    }

    fun hasBackgroundLocation(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_BACKGROUND_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    fun isUsageAccessGranted(context: Context): Boolean {
        try {
            val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), context.packageName)
            return mode == AppOpsManager.MODE_ALLOWED
        } catch (e: Exception) {
            return false
        }
    }

    fun isNotificationAccessEnabled(context: Context): Boolean {
        val enabled = NotificationManagerCompat.getEnabledListenerPackages(context)
        return enabled.contains(context.packageName)
    }

    fun isAccessibilityEnabled(context: Context): Boolean {
        val accessibilityEnabled = Settings.Secure.getInt(context.contentResolver, Settings.Secure.ACCESSIBILITY_ENABLED, 0)
        if (accessibilityEnabled == 0) return false
        val services = Settings.Secure.getString(context.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES)
        return services?.contains(context.packageName) == true
    }

    fun isDeviceAdminActive(context: Context, receiver: ComponentName): Boolean {
        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as android.app.admin.DevicePolicyManager
        return dpm.isAdminActive(receiver)
    }

    fun isIgnoringBatteryOptimizations(context: Context): Boolean {
        val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return pm.isIgnoringBatteryOptimizations(context.packageName)
    }

    fun openAppNotificationSettings(context: Context) {
        val intent = Intent()
        intent.action = Settings.ACTION_APP_NOTIFICATION_SETTINGS
        intent.putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
        context.startActivity(intent)
    }

    fun openUsageAccessSettings(context: Context) {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        context.startActivity(intent)
    }

    fun openAccessibilitySettings(context: Context) {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        context.startActivity(intent)
    }

    fun openNotificationListenerSettings(context: Context) {
        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
        context.startActivity(intent)
    }

    fun openLocationSettings(context: Context) {
        val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
        context.startActivity(intent)
    }

    fun openIgnoreBatteryOptimizations(context: Context) {
        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
        intent.data = Uri.parse("package:${context.packageName}")
        context.startActivity(intent)
    }

    fun openAppSettings(context: Context) {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
        intent.data = Uri.parse("package:${context.packageName}")
        context.startActivity(intent)
    }
}
