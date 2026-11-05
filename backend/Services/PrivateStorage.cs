namespace Portfolio.Api.Services;

internal static class PrivateStorage
{
    public static string CreateDirectory(string? configuredPath, string folder, IWebHostEnvironment environment)
    {
        var directory = Path.GetFullPath(configuredPath
            ?? Path.Combine(AppContext.BaseDirectory, "App_Data", folder));
        var relative = Path.GetRelativePath(Path.GetFullPath(environment.WebRootPath), directory);
        // Static files are public. Refuse configuration that would expose saved messages or answers.
        if (!Path.IsPathRooted(relative) && relative != ".."
            && !relative.StartsWith(".." + Path.DirectorySeparatorChar, StringComparison.Ordinal)
            && !relative.StartsWith(".." + Path.AltDirectorySeparatorChar, StringComparison.Ordinal))
            throw new InvalidOperationException("Private storage must be outside the public web root.");
        Directory.CreateDirectory(directory);
        return directory;
    }
}
