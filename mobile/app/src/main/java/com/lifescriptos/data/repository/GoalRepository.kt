package com.lifescriptos.data.repository

import com.lifescriptos.domain.model.Goal
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GoalRepository @Inject constructor(
    private val supabaseClient: SupabaseClient,
    private val authRepository: AuthRepository
) {
    suspend fun getGoals(): Result<List<Goal>> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: return Result.success(emptyList())
            val goals = supabaseClient.postgrest["goals"]
                .select {
                    filter { eq("user_id", userId) }
                    order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                }
                .decodeList<Goal>()
            Result.success(goals)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createGoal(goal: Goal): Result<Goal> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: throw Exception("Not authenticated")
            val newGoal = goal.copy(userId = userId)
            val created = supabaseClient.postgrest["goals"]
                .insert(newGoal) { select() }
                .decodeSingle<Goal>()
            Result.success(created)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateGoal(goal: Goal): Result<Goal> {
        return try {
            val updated = supabaseClient.postgrest["goals"]
                .update(goal) {
                    filter { eq("id", goal.id) }
                    select()
                }
                .decodeSingle<Goal>()
            Result.success(updated)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateGoalProgress(goalId: String, progress: Int): Result<Goal> {
        return try {
            val isCompleted = progress >= 100
            val updated = supabaseClient.postgrest["goals"]
                .update(mapOf(
                    "progress_percentage" to progress,
                    "is_completed" to isCompleted
                )) {
                    filter { eq("id", goalId) }
                    select()
                }
                .decodeSingle<Goal>()
            Result.success(updated)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteGoal(goalId: String): Result<Unit> {
        return try {
            supabaseClient.postgrest["goals"]
                .delete {
                    filter { eq("id", goalId) }
                }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
