namespace InconsistentClasses
{
    public class PersonalDataAccess
    {
        private IPeopleRepository _peopleRepository;

        public PersonalDataAccess(IPeopleRepository peopleRepository)
        {
            _peopleRepository = peopleRepository;
        }

        public Person GetById(int id)
        {
            var person = _peopleRepository.GetById(id);

            if (person == null)
            {
                throw new Exception(
                    $"No person with id {id} was found in the database.");
            }

            return person;
        }

        public Person GetByNames(string firstName, string lastName)
        {
            var person = _peopleRepository.GetByNames(firstName, lastName);

            if (person == null)
            {
                Console.WriteLine(
                    $"No person named {firstName} {lastName} was found in the database.");
            }

            return person;
        }

        public bool GetByDateOfBirth(DateTime dateOfBirth, out Person result)
        {
            result = _peopleRepository.GetByDateOfBirth(dateOfBirth);

            if (result == null)
            {
                return false;
            }

            return true;
        }
    }

    public interface IPeopleRepository
    {
        Person GetById(int id);
        Person GetByNames(string firstName, string lastName);
        Person GetByDateOfBirth(DateTime dateOfBirth);
    }

    public class Person
    {

    }
}