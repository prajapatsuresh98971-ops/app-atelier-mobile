package com.example.permissionwizard

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class MyAccessibilityService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Handle accessibility events if needed
    }

    override fun onInterrupt() {}
}
