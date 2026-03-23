Console.WriteLine("Are all of 1,2,3,4 even:");
Console.WriteLine(AreAllEven(new List<int> { 1, 2, 3, 4 }));
                                            //empty line to separate those two method calls
Console.WriteLine("Are all of 2,4,6,8 even:");
Console.WriteLine(AreAllEven(new List<int> { 2, 4, 6, 8 }));

//you can use this file to try out any code you want
Console.WriteLine("Press any key to close.");
Console.ReadKey();


Console.ReadKey();

bool AreAllEven(List<int> numbers)
{
    for (int i = 0; i < numbers.Count; i++)
    {
        if (numbers[i] % 2 != 0)
        {
            return false;
        }
    }
    return true;
}

bool AreAllEven_BadFormatting(List<int> numbers)
{
    for (int i = 0; i < numbers.Count; i++) if (numbers[i] % 2 != 0) return false;
    return true;
}

                                            //empty line between methods
void CountEvenAndOdd(List<int> numbers)
{
    int totalEven = 0;
    int totalOdd = 0;

    for (int i = 0; i < numbers.Count; i++)
    {
        Console.WriteLine($"Processing number at index {i}");

        if (numbers[i] % 2 == 0)
        {
            totalEven++;
        }
        else
        {
            totalOdd++;
        }
    }

    Console.WriteLine($"Total even numbers: {totalEven}");
    Console.WriteLine($"Total odd numbers: {totalOdd}");
}

int DoubleSum(int a, int b)
{
    int sum = a + b;
    return sum * 2;
}

//placing each parameter in its own line can make the code more readable
bool IsWithinRange(
    int min, 
    int max, 
    int value,
    bool isInclusive)
{
    if (isInclusive)
    {
        return value >= min && value <= max;
    }
    else
    {
        return value > min &&
        value < max;
    }
}













