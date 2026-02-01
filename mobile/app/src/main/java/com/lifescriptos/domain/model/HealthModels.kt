package com.lifescriptos.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class SleepLog(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    @SerialName("log_date") val logDate: String,
    @SerialName("sleep_time") val sleepTime: String? = null,
    @SerialName("wake_time") val wakeTime: String? = null,
    @SerialName("duration_hours") val durationHours: Double? = null,
    val quality: String? = null,
    val notes: String? = null,
    @SerialName("created_at") val createdAt: String = ""
)

@Serializable
data class NutritionLog(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    @SerialName("log_date") val logDate: String,
    @SerialName("meal_type") val mealType: String,
    @SerialName("food_items") val foodItems: String,
    val calories: Int? = null,
    @SerialName("protein_grams") val proteinGrams: Double? = null,
    @SerialName("carbs_grams") val carbsGrams: Double? = null,
    @SerialName("fats_grams") val fatsGrams: Double? = null,
    @SerialName("fiber_grams") val fiberGrams: Double? = null,
    val notes: String? = null,
    @SerialName("created_at") val createdAt: String = ""
)

@Serializable
data class ExerciseLog(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    @SerialName("log_date") val logDate: String,
    @SerialName("exercise_type") val exerciseType: String,
    @SerialName("duration_minutes") val durationMinutes: Int? = null,
    @SerialName("calories_burned") val caloriesBurned: Int? = null,
    @SerialName("distance_km") val distanceKm: Double? = null,
    val steps: Int? = null,
    val notes: String? = null,
    @SerialName("created_at") val createdAt: String = ""
)
