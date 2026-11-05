using System.ComponentModel.DataAnnotations;

namespace Portfolio.Api.Models;

public sealed record Question(string Id, string Text);
public sealed record QuestionnaireDefinition(string Id, string Title, int MinValue, int MaxValue, IReadOnlyList<Question> Questions);
public sealed class SubmitAnswersRequest
{
    [Required, MinLength(5), MaxLength(5)]
    public Dictionary<string, int>? Answers { get; init; }
}
public sealed record AnswerResult(string QuestionId, string Question, int Value);
public sealed record SubmissionResult(Guid Id, DateTimeOffset CreatedAt, int Score, int MaxScore, string Description, IReadOnlyList<AnswerResult> Answers);
