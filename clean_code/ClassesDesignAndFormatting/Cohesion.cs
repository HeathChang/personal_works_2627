namespace Cohesion;

//this class is highly cohesive
class PetsCollection
{
    private List<Pet> _pets = new List<Pet>();
    public int Count => _pets.Count;

    public void Add(Pet pet)
    {
        _pets.Add(pet);
    }

    public IEnumerable<PetType> GetCurrentlyStoredTypes()
    {
        return _pets.Select(pet => pet.PetType).Distinct();
    }

    public bool Contains(PetType petType)
    {
        return GetCurrentlyStoredTypes().Any(type => type == petType);
    }
}

//this class is not cohesive
public class HousePricerLowCohesion
{
    private IOwnersDatabase _ownersDatabase;
    private decimal _dollarsPerSquareMeter;

    public HousePricerLowCohesion(
        decimal dollarsPerSquareMeter,
        IOwnersDatabase ownersDatabase)
    {
        _dollarsPerSquareMeter = dollarsPerSquareMeter;
        _ownersDatabase = ownersDatabase;
    }

    public decimal GetPrice(House house)
    {
        return
            _dollarsPerSquareMeter *
            (decimal)house.Area *
            GetPriceMultiplierBasedOnFloors(house.Floors);
    }

    private decimal GetPriceMultiplierBasedOnFloors(int floors)
    {
        return floors switch { 1 => 1m, 2 => 1.5m, _ => 1.6m };
    }

    public void SendPriceToOwner(House house)
    {
        Console.WriteLine($"Sending price {GetPrice(house)}" +
            $" to {FindOwnerEmail(house.Address)}");
    }

    private string FindOwnerEmail(string address)
    {
        return _ownersDatabase.GetEmailByAddress(address);
    }
}

//those two classes are cohesive
public class HousePricer
{
    private decimal _dollarsPerSquareMeter;

    public HousePricer(decimal dollarsPerSquareMeter)
    {
        _dollarsPerSquareMeter = dollarsPerSquareMeter;
    }

    public decimal GetPrice(House house)
    {
        return
            _dollarsPerSquareMeter *
            (decimal)house.Area *
            GetPriceMultiplierBasedOnFloors(house.Floors);
    }

    private decimal GetPriceMultiplierBasedOnFloors(int floors)
    {
        return floors switch { 1 => 1m, 2 => 1.5m, _ => 1.6m };
    }
}

public class OwnerNotifier
{
    private IOwnersDatabase _ownersDatabase;
    public OwnerNotifier(IOwnersDatabase ownersDatabase)
    {
        _ownersDatabase = ownersDatabase;
    }

    public void SendPriceToOwner(decimal price, string address)
    {
        Console.WriteLine($"Sending price {price}" +
            $" to {FindOwnerEmail(address)}");
    }

    private string FindOwnerEmail(string address)
    {
        return _ownersDatabase.GetEmailByAddress(address);
    }
}

public record Pet(string Name, PetType PetType, float Weight);
public enum PetType { Cat, Dog, Fish }
public record House(string Address, double Area, int Floors);

public interface IOwnersDatabase
{
    string GetEmailByAddress(string address);
}