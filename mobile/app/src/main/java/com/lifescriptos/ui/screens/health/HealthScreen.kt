package com.lifescriptos.ui.screens.health

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.lifescriptos.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HealthScreen(
    viewModel: HealthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showMealDialog by remember { mutableStateOf(false) }
    var showExerciseDialog by remember { mutableStateOf(false) }
    var showSleepDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.loadHealthData()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Health") }
            )
        }
    ) { padding ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item { Spacer(modifier = Modifier.height(8.dp)) }

                // Summary Cards
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        HealthSummaryCard(
                            modifier = Modifier.weight(1f),
                            icon = Icons.Filled.Restaurant,
                            iconColor = Warning,
                            title = "Calories",
                            value = "${viewModel.getTotalCalories()}",
                            subtitle = "/ ${uiState.calorieGoal} kcal",
                            progress = viewModel.getTotalCalories().toFloat() / uiState.calorieGoal
                        )
                        HealthSummaryCard(
                            modifier = Modifier.weight(1f),
                            icon = Icons.Filled.LocalFireDepartment,
                            iconColor = Error,
                            title = "Burned",
                            value = "${viewModel.getTotalCaloriesBurned()}",
                            subtitle = "kcal",
                            progress = null
                        )
                    }
                }

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        HealthSummaryCard(
                            modifier = Modifier.weight(1f),
                            icon = Icons.Filled.Bedtime,
                            iconColor = Secondary,
                            title = "Sleep",
                            value = String.format("%.1f", viewModel.getTotalSleepHours()),
                            subtitle = "hours",
                            progress = (viewModel.getTotalSleepHours() / 8.0).toFloat().coerceAtMost(1f)
                        )
                        HealthSummaryCard(
                            modifier = Modifier.weight(1f),
                            icon = Icons.Filled.FitnessCenter,
                            iconColor = Success,
                            title = "Protein",
                            value = String.format("%.0f", viewModel.getTotalProtein()),
                            subtitle = "grams",
                            progress = null
                        )
                    }
                }

                // Quick Add Buttons
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        QuickAddButton(
                            modifier = Modifier.weight(1f),
                            icon = Icons.Outlined.Restaurant,
                            label = "Add Meal",
                            onClick = { showMealDialog = true }
                        )
                        QuickAddButton(
                            modifier = Modifier.weight(1f),
                            icon = Icons.Outlined.FitnessCenter,
                            label = "Add Exercise",
                            onClick = { showExerciseDialog = true }
                        )
                        QuickAddButton(
                            modifier = Modifier.weight(1f),
                            icon = Icons.Outlined.Bedtime,
                            label = "Log Sleep",
                            onClick = { showSleepDialog = true }
                        )
                    }
                }

                // Nutrition Logs
                if (uiState.nutritionLogs.isNotEmpty()) {
                    item {
                        Text(
                            text = "Meals Today",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    items(uiState.nutritionLogs) { log ->
                        MealCard(
                            mealType = log.mealType,
                            foodItems = log.foodItems,
                            calories = log.calories,
                            protein = log.proteinGrams
                        )
                    }
                }

                // Exercise Logs
                if (uiState.exerciseLogs.isNotEmpty()) {
                    item {
                        Text(
                            text = "Exercise Today",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    items(uiState.exerciseLogs) { log ->
                        ExerciseCard(
                            exerciseType = log.exerciseType,
                            duration = log.durationMinutes,
                            caloriesBurned = log.caloriesBurned
                        )
                    }
                }

                item { Spacer(modifier = Modifier.height(16.dp)) }
            }
        }
    }

    // Dialogs
    if (showMealDialog) {
        AddMealDialog(
            onDismiss = { showMealDialog = false },
            onAdd = { mealType, food, calories, protein ->
                viewModel.addNutritionLog(mealType, food, calories, protein)
                showMealDialog = false
            }
        )
    }

    if (showExerciseDialog) {
        AddExerciseDialog(
            onDismiss = { showExerciseDialog = false },
            onAdd = { type, duration, calories ->
                viewModel.addExerciseLog(type, duration, calories)
                showExerciseDialog = false
            }
        )
    }

    if (showSleepDialog) {
        AddSleepDialog(
            onDismiss = { showSleepDialog = false },
            onAdd = { duration, quality ->
                viewModel.addSleepLog(null, null, duration, quality)
                showSleepDialog = false
            }
        )
    }
}

@Composable
private fun HealthSummaryCard(
    modifier: Modifier = Modifier,
    icon: ImageVector,
    iconColor: Color,
    title: String,
    value: String,
    subtitle: String,
    progress: Float?
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(iconColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                verticalAlignment = Alignment.Bottom
            ) {
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    modifier = Modifier.padding(bottom = 4.dp)
                )
            }
            if (progress != null) {
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { progress.coerceIn(0f, 1f) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp)),
                    color = iconColor,
                    trackColor = iconColor.copy(alpha = 0.2f)
                )
            }
        }
    }
}

@Composable
private fun QuickAddButton(
    modifier: Modifier = Modifier,
    icon: ImageVector,
    label: String,
    onClick: () -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        contentPadding = PaddingValues(12.dp)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall
            )
        }
    }
}

@Composable
private fun MealCard(
    mealType: String,
    foodItems: String,
    calories: Int?,
    protein: Double?
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Filled.Restaurant,
                contentDescription = null,
                tint = Warning,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = mealType.replaceFirstChar { it.uppercase() },
                    style = MaterialTheme.typography.labelSmall,
                    color = Warning
                )
                Text(
                    text = foodItems,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                if (calories != null) {
                    Text(
                        text = "$calories kcal",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold
                    )
                }
                if (protein != null) {
                    Text(
                        text = "${protein.toInt()}g protein",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
            }
        }
    }
}

@Composable
private fun ExerciseCard(
    exerciseType: String,
    duration: Int?,
    caloriesBurned: Int?
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Filled.FitnessCenter,
                contentDescription = null,
                tint = Success,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = exerciseType,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
                if (duration != null) {
                    Text(
                        text = "$duration min",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
            }
            if (caloriesBurned != null) {
                Text(
                    text = "-$caloriesBurned kcal",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold,
                    color = Error
                )
            }
        }
    }
}

@Composable
private fun AddMealDialog(
    onDismiss: () -> Unit,
    onAdd: (String, String, Int?, Double?) -> Unit
) {
    var mealType by remember { mutableStateOf("breakfast") }
    var food by remember { mutableStateOf("") }
    var calories by remember { mutableStateOf("") }
    var protein by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Meal") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("breakfast", "lunch", "dinner", "snack").forEach { type ->
                        FilterChip(
                            selected = mealType == type,
                            onClick = { mealType = type },
                            label = { Text(type.replaceFirstChar { it.uppercase() }) }
                        )
                    }
                }
                OutlinedTextField(
                    value = food,
                    onValueChange = { food = it },
                    label = { Text("Food items") },
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = calories,
                        onValueChange = { calories = it },
                        label = { Text("Calories") },
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = protein,
                        onValueChange = { protein = it },
                        label = { Text("Protein (g)") },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (food.isNotBlank()) {
                        onAdd(mealType, food, calories.toIntOrNull(), protein.toDoubleOrNull())
                    }
                },
                enabled = food.isNotBlank()
            ) { Text("Add") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@Composable
private fun AddExerciseDialog(
    onDismiss: () -> Unit,
    onAdd: (String, Int?, Int?) -> Unit
) {
    var type by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("") }
    var calories by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Exercise") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = type,
                    onValueChange = { type = it },
                    label = { Text("Exercise type") },
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = duration,
                        onValueChange = { duration = it },
                        label = { Text("Duration (min)") },
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = calories,
                        onValueChange = { calories = it },
                        label = { Text("Calories") },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (type.isNotBlank()) {
                        onAdd(type, duration.toIntOrNull(), calories.toIntOrNull())
                    }
                },
                enabled = type.isNotBlank()
            ) { Text("Add") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@Composable
private fun AddSleepDialog(
    onDismiss: () -> Unit,
    onAdd: (Double, String?) -> Unit
) {
    var hours by remember { mutableStateOf("7") }
    var quality by remember { mutableStateOf("good") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Log Sleep") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = hours,
                    onValueChange = { hours = it },
                    label = { Text("Hours slept") },
                    modifier = Modifier.fillMaxWidth()
                )
                Text("Quality", style = MaterialTheme.typography.labelMedium)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("poor", "fair", "good", "great").forEach { q ->
                        FilterChip(
                            selected = quality == q,
                            onClick = { quality = q },
                            label = { Text(q.replaceFirstChar { it.uppercase() }) }
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    hours.toDoubleOrNull()?.let { onAdd(it, quality) }
                },
                enabled = hours.toDoubleOrNull() != null
            ) { Text("Log") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
