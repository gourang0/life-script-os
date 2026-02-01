package com.lifescriptos.ui.navigation

sealed class Screen(val route: String) {
    object Auth : Screen("auth")
    object Dashboard : Screen("dashboard")
    object Goals : Screen("goals")
    object Tasks : Screen("tasks")
    object Schedule : Screen("schedule")
    object Health : Screen("health")
    object Analytics : Screen("analytics")
    object Profile : Screen("profile")
}

val bottomNavItems = listOf(
    Screen.Dashboard,
    Screen.Goals,
    Screen.Tasks,
    Screen.Schedule,
    Screen.Health
)
