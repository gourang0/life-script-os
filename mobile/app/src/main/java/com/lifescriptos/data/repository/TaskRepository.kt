package com.lifescriptos.data.repository

import com.lifescriptos.domain.model.Task
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TaskRepository @Inject constructor(
    private val supabaseClient: SupabaseClient,
    private val authRepository: AuthRepository
) {
    suspend fun getTasks(): Result<List<Task>> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: return Result.success(emptyList())
            val tasks = supabaseClient.postgrest["tasks"]
                .select {
                    filter { eq("user_id", userId) }
                    order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                }
                .decodeList<Task>()
            Result.success(tasks)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTasksByDate(date: String): Result<List<Task>> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: return Result.success(emptyList())
            val tasks = supabaseClient.postgrest["tasks"]
                .select {
                    filter { 
                        eq("user_id", userId)
                        eq("scheduled_date", date)
                    }
                    order("scheduled_start_time", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
                }
                .decodeList<Task>()
            Result.success(tasks)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createTask(task: Task): Result<Task> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: throw Exception("Not authenticated")
            val newTask = task.copy(userId = userId)
            val created = supabaseClient.postgrest["tasks"]
                .insert(newTask) { select() }
                .decodeSingle<Task>()
            Result.success(created)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateTask(task: Task): Result<Task> {
        return try {
            val updated = supabaseClient.postgrest["tasks"]
                .update(task) {
                    filter { eq("id", task.id) }
                    select()
                }
                .decodeSingle<Task>()
            Result.success(updated)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteTask(taskId: String): Result<Unit> {
        return try {
            supabaseClient.postgrest["tasks"]
                .delete {
                    filter { eq("id", taskId) }
                }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun toggleTaskCompletion(taskId: String, isCompleted: Boolean): Result<Task> {
        return try {
            val completedAt = if (isCompleted) java.time.Instant.now().toString() else null
            val updated = supabaseClient.postgrest["tasks"]
                .update(mapOf(
                    "is_completed" to isCompleted,
                    "completed_at" to completedAt
                )) {
                    filter { eq("id", taskId) }
                    select()
                }
                .decodeSingle<Task>()
            Result.success(updated)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
