using System.Text.RegularExpressions;

public class BlogPostsStorage
{
    private IPostsRepository _postsRepository;

    public BlogPostsStorage(IPostsRepository postsRepository)
    {
        _postsRepository = postsRepository;
    }

    public void SaveBlogPost(string content, DateTime createdDate)
    {
        var cleanedContent = Clean(content);

        _postsRepository.Save(cleanedContent, createdDate);
    }

    // should be split along this line -------

    private string Clean(string content)
    {
        RegexOptions options = RegexOptions.None;
        Regex regex = new Regex("[ ]{2,}", options);
        return regex.Replace(content, " ");
    }
}

public interface IPostsRepository
{
    void Save(string content, DateTime createdDate);
}