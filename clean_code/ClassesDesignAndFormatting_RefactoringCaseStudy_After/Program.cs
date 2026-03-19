VacationPlanner planner = new VacationPlanner(
    new PolishPublicHolidaysProvider());

int vacationDaysToUse = 5;

var optimalVacation = planner.FindOptimalVacation(
    vacationDaysToUse, 2025);

var vacationPlanPrinter = new VacationPlanPrinter(
    new ConsoleUserCommunication());
vacationPlanPrinter.ShowReport(optimalVacation, vacationDaysToUse);

Console.ReadKey();
