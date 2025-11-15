package com.example.permissionwizard

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Intent
import android.location.LocationManager
import android.media.projection.MediaProjectionManager
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat

class MainActivity : ComponentActivity() {

    private val requestCameraLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted -> }
    private val requestAudioLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted -> }
    private val requestFineLocationLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted -> }
    private val requestBackgroundLocationLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted -> }

    private val screenCaptureLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        // handle screen capture permission result
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            PermissionWizardScreen(this)
        }
    }
}

@Composable
fun PermissionWizardScreen(activity: Activity) {
    val componentName = remember { ComponentName(activity, MyDeviceAdminReceiver::class.java) }

    Scaffold(topBar = { TopAppBar(title = { Text("Permission Setup Wizard") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            PermissionCard(
                name = "Camera",
                description = "Allow the app to access the camera for snapshots/streaming",
                enabled = PermissionUtils.hasCameraPermission(activity),
                onEnable = { ActivityCompat.requestPermissions(activity, arrayOf(android.Manifest.permission.CAMERA), 1001) }
            )

            PermissionCard(
                name = "Microphone",
                description = "Allow audio capture",
                enabled = PermissionUtils.hasMicrophonePermission(activity),
                onEnable = { ActivityCompat.requestPermissions(activity, arrayOf(android.Manifest.permission.RECORD_AUDIO), 1002) }
            )

            PermissionCard(
                name = "Location",
                description = "Fine location for real-time tracking",
                enabled = PermissionUtils.hasFineLocation(activity),
                onEnable = { ActivityCompat.requestPermissions(activity, arrayOf(android.Manifest.permission.ACCESS_FINE_LOCATION), 1003) }
            )

            PermissionCard(
                name = "Background Location",
                description = "Background location for scheduled tracking",
                enabled = PermissionUtils.hasBackgroundLocation(activity),
                onEnable = { ActivityCompat.requestPermissions(activity, arrayOf(android.Manifest.permission.ACCESS_BACKGROUND_LOCATION), 1004) }
            )

            PermissionCard(
                name = "Usage Access",
                description = "Allow the app to access usage stats",
                enabled = PermissionUtils.isUsageAccessGranted(activity),
                onEnable = { activity.startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)) }
            )

            PermissionCard(
                name = "Notification Access",
                description = "Allow reading notifications",
                enabled = PermissionUtils.isNotificationAccessEnabled(activity),
                onEnable = { activity.startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)) }
            )

            PermissionCard(
                name = "Accessibility Service",
                description = "Accessibility permissions to enable monitoring features",
                enabled = PermissionUtils.isAccessibilityEnabled(activity),
                onEnable = { activity.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
            )

            PermissionCard(
                name = "Device Admin",
                description = "Activate device admin to enable lock/wipe features",
                enabled = PermissionUtils.isDeviceAdminActive(activity, componentName),
                onEnable = {
                    val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN)
                    intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, componentName)
                    intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, "Device admin is required for parental controls")
                    activity.startActivity(intent)
                }
            )

            PermissionCard(
                name = "Screen Capture",
                description = "Allow screen capture for monitoring",
                enabled = false,
                onEnable = {
                    val mediaProjectionManager = activity.getSystemService(Activity.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
                    val intent = mediaProjectionManager.createScreenCaptureIntent()
                    activity.startActivityForResult(intent, MediaProjectionHelper.REQUEST_CODE_SCREEN_CAPTURE)
                }
            )

            PermissionCard(
                name = "Battery Optimization",
                description = "Allow ignoring battery optimization to keep background services running",
                enabled = PermissionUtils.isIgnoringBatteryOptimizations(activity),
                onEnable = { PermissionUtils.openIgnoreBatteryOptimizations(activity) }
            )

            Spacer(modifier = Modifier.height(12.dp))

            Button(onClick = {
                // check all permissions and show result
            }, modifier = Modifier.fillMaxWidth()) {
                Text(text = "Complete Setup")
            }
        }
    }
}

@Composable
fun PermissionCard(name: String, description: String, enabled: Boolean, onEnable: () -> Unit) {
    Card(shape = RoundedCornerShape(8.dp), elevation = 4.dp, modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = name, style = MaterialTheme.typography.h6)
                Text(text = description, style = MaterialTheme.typography.body2)
            }
            Column(horizontalAlignment = Alignment.End) {
                if (enabled) {
                    Text(text = "Enabled", color = Color(0xFF0F9D58))
                } else {
                    Text(text = "Not Enabled", color = Color(0xFFB00020))
                }
                Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = onEnable) {
                    Text(text = "Enable")
                }
            }
        }
    }
}
