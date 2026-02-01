package com.lifescriptos.data.repository

import com.lifescriptos.domain.model.Profile
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProfileRepository @Inject constructor(
    private val supabaseClient: SupabaseClient,
    private val authRepository: AuthRepository
) {
    suspend fun getProfile(): Result<Profile?> {
        return try {
            val userId = authRepository.getCurrentUserId() ?: return Result.success(null)
            val profile = supabaseClient.postgrest["profiles"]
                .select {
                    filter { eq("id", userId) }
                }
                .decodeSingleOrNull<Profile>()
            Result.success(profile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateProfile(profile: Profile): Result<Profile> {
        return try {
            val updated = supabaseClient.postgrest["profiles"]
                .update(profile) {
                    filter { eq("id", profile.id) }
                }
                .decodeSingle<Profile>()
            Result.success(updated)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
