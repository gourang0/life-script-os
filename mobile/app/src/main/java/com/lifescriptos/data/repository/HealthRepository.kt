package com.lifescriptos.data.repository

import com.lifescriptos.domain.model.SleepLog
import com.lifescriptos.domain.model.NutritionLog
import com.lifescriptos.domain.model.ExerciseLog
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HealthRepository @Inject constructor(
    private val supabaseClient: SupabaseClient,
    private val authRepository: AuthRepository
) {
    // Sleep Logs
    suspend fun getSleepLogs(date: String): Result<List<SleepLog>> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: return Result.success(emptyList())
            val logs = supabaseClient.postgrest["sleep_logs"]
                .select {
                    filter { 
                        eq("user_id", userId)
                        eq("log_date", date)
                    }
                }
                .decodeList<SleepLog>()
            Result.success(logs)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addSleepLog(log: SleepLog): Result<SleepLog> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: throw Exception("Not authenticated")
            val newLog = log.copy(userId = userId)
            val created = supabaseClient.postgrest["sleep_logs"]
                .insert(newLog) { select() }
                .decodeSingle<SleepLog>()
            Result.success(created)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Nutrition Logs
    suspend fun getNutritionLogs(date: String): Result<List<NutritionLog>> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: return Result.success(emptyList())
            val logs = supabaseClient.postgrest["nutrition_logs"]
                .select {
                    filter { 
                        eq("user_id", userId)
                        eq("log_date", date)
                    }
                }
                .decodeList<NutritionLog>()
            Result.success(logs)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addNutritionLog(log: NutritionLog): Result<NutritionLog> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: throw Exception("Not authenticated")
            val newLog = log.copy(userId = userId)
            val created = supabaseClient.postgrest["nutrition_logs"]
                .insert(newLog) { select() }
                .decodeSingle<NutritionLog>()
            Result.success(created)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Exercise Logs
    suspend fun getExerciseLogs(date: String): Result<List<ExerciseLog>> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: return Result.success(emptyList())
            val logs = supabaseClient.postgrest["exercise_logs"]
                .select {
                    filter { 
                        eq("user_id", userId)
                        eq("log_date", date)
                    }
                }
                .decodeList<ExerciseLog>()
            Result.success(logs)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addExerciseLog(log: ExerciseLog): Result<ExerciseLog> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: throw Exception("Not authenticated")
            val newLog = log.copy(userId = userId)
            val created = supabaseClient.postgrest["exercise_logs"]
                .insert(newLog) { select() }
                .decodeSingle<ExerciseLog>()
            Result.success(created)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
