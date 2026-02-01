package com.lifescriptos.data.repository

import com.lifescriptos.domain.model.ScheduleEntry
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ScheduleRepository @Inject constructor(
    private val supabaseClient: SupabaseClient,
    private val authRepository: AuthRepository
) {
    suspend fun getScheduleEntries(date: String): Result<List<ScheduleEntry>> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: return Result.success(emptyList())
            val entries = supabaseClient.postgrest["schedule_entries"]
                .select {
                    filter { 
                        eq("user_id", userId)
                        eq("entry_date", date)
                    }
                    order("start_time", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
                }
                .decodeList<ScheduleEntry>()
            Result.success(entries)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createScheduleEntry(entry: ScheduleEntry): Result<ScheduleEntry> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: throw Exception("Not authenticated")
            val newEntry = entry.copy(userId = userId)
            val created = supabaseClient.postgrest["schedule_entries"]
                .insert(newEntry) { select() }
                .decodeSingle<ScheduleEntry>()
            Result.success(created)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateScheduleEntry(entry: ScheduleEntry): Result<ScheduleEntry> {
        return try {
            val updated = supabaseClient.postgrest["schedule_entries"]
                .update(entry) {
                    filter { eq("id", entry.id) }
                    select()
                }
                .decodeSingle<ScheduleEntry>()
            Result.success(updated)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun toggleEntryCompletion(entryId: String, isCompleted: Boolean): Result<ScheduleEntry> {
        return try {
            val completedAt = if (isCompleted) java.time.Instant.now().toString() else null
            val updated = supabaseClient.postgrest["schedule_entries"]
                .update(mapOf(
                    "is_completed" to isCompleted,
                    "completed_at" to completedAt
                )) {
                    filter { eq("id", entryId) }
                    select()
                }
                .decodeSingle<ScheduleEntry>()
            Result.success(updated)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteScheduleEntry(entryId: String): Result<Unit> {
        return try {
            supabaseClient.postgrest["schedule_entries"]
                .delete {
                    filter { eq("id", entryId) }
                }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
