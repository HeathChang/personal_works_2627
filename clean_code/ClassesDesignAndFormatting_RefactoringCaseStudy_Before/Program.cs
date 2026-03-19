VacationPlanner planner = new VacationPlanner();

int vacationDaysToUse = 5;

var optimalVacation = planner.FindOptimalVacation(vacationDaysToUse, 2025);
planner.ShowReport(optimalVacation, vacationDaysToUse);

Console.ReadKey();
