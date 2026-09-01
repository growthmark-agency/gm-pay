package com.gmpay.listener

import android.app.Application
import android.content.Context
import android.content.SharedPreferences

class GMApplication : Application() {
    companion object {
        lateinit var prefs: SharedPreferences
    }

    override fun onCreate() {
        super.onCreate()
        prefs = getSharedPreferences("gm_pay_prefs", Context.MODE_PRIVATE)
    }
}
