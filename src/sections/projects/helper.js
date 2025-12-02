// 🔁 Helper: calculate the average value of a numeric field (e.g. progress)
// It recursively traverses all leaf subtasks (those without children)
// and clamps each value and the final average to a maximum of 100
export function averageSubtaskField(subtasks, field) {
  if (!Array.isArray(subtasks) || subtasks.length === 0) return 0;

  let total = 0;
  let count = 0;

  const traverse = (subs) => {
    for (const sub of subs) {
      if (Array.isArray(sub.subtasks) && sub.subtasks.length > 0) {
        // Recursively traverse deeper levels
        traverse(sub.subtasks);
      } else {
        // Only count leaf subtasks
        let value = parseFloat(sub[field]) || 0;

        // Clamp each subtask value to a maximum of 100
        if (value > 100) value = 100;

        total += value;
        count += 1;
      }
    }
  };

  traverse(subtasks);

  // Calculate average and clamp the result to 100
  const avg = count > 0 ? total / count : 0;
  return Number(Math.min(avg, 100).toFixed(1));
}

// 🔁 Helper: sum only leaf subtasks (those without children)
export function sumSubtaskField(subtasks, field) {
  if (!Array.isArray(subtasks)) return 0;

  return subtasks.reduce((total, sub) => {
    // jika subtask punya anak → hitung anak-anaknya saja (bukan dirinya)
    if (Array.isArray(sub.subtasks) && sub.subtasks.length > 0) {
      return total + sumSubtaskField(sub.subtasks, field);
    }

    // jika subtask tidak punya anak → gunakan nilainya
    const val = parseFloat(sub[field]) || 0;
    return total + val;
  }, 0);
}

// ────────────────────────────────
// 🔁 Recursive Row Renderer
// ────────────────────────────────
export function findTaskIndexPath(tasks, id, path = []) {
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    if (task.id === id) {
      return [...path, i]; // ditemukan
    }

    if (task.subtasks?.length) {
      const found = findTaskIndexPath(task.subtasks, id, [
        ...path,
        i,
        "subtasks",
      ]);
      if (found) return found;
    }
  }

  return null; // tidak ditemukan
}

//  Determine the task's timeframe status based on remaining days and progress.
export function getTimeFrame(daysRemaining, totalProgress, startDate) {
  // Validate inputs
  if (
    daysRemaining === undefined ||
    totalProgress === undefined ||
    !startDate
  ) {
    return "No Dates";
  }

  const now = new Date();
  const start = new Date(startDate);

  if (now < start) return "Open";
  if (daysRemaining >= 0 && totalProgress >= 100) return "Done";
  if (daysRemaining < 0 && totalProgress < 100) return "Delay";
  if (daysRemaining < 0 && totalProgress >= 100) return "Delay";
  if (daysRemaining >= 0 && totalProgress < 100) return "On Going";

  return "No Dates";
}
