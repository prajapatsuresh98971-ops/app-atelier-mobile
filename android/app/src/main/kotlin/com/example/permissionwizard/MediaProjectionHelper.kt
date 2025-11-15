package com.example.permissionwizard

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager

object MediaProjectionHelper {
    const val REQUEST_CODE_SCREEN_CAPTURE = 1001

    fun createScreenCaptureIntent(activity: Activity): Intent? {
        val mediaProjectionManager = activity.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        return mediaProjectionManager.createScreenCaptureIntent()
    }
}
