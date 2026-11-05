using System.ComponentModel.DataAnnotations;

namespace Portfolio.Api.Models;

public sealed class ContactRequest
{
    [Required, StringLength(100)]
    public string? Name { get; init; }

    [Required, EmailAddress, StringLength(254)]
    public string? Email { get; init; }

    [Required, StringLength(150)]
    public string? Subject { get; init; }

    [Required, StringLength(4000)]
    public string? Message { get; init; }
}

public sealed record ContactMessage(Guid Id, DateTimeOffset CreatedAt, string Name, string Email, string Subject, string Message);
public sealed record ContactReceipt(Guid Id, DateTimeOffset CreatedAt, string Message);
