using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

public sealed class QuestionnaireService
{
    public QuestionnaireDefinition Definition { get; } = new("programming-interest", "Chuť učit se programovat", 1, 5,
    [
        new("q1", "Baví mě hledat řešení logických problémů."),
        new("q2", "Chci vytvářet vlastní weby, hry nebo aplikace."),
        new("q3", "Když něco nefunguje, rád/a zkouším jiné řešení."),
        new("q4", "Dokážu si pravidelně vyhradit čas na učení."),
        new("q5", "Baví mě učit se nové nástroje a technologie.")
    ]);

    public SubmissionResult? Evaluate(IReadOnlyDictionary<string, int> answers)
    {
        if (answers.Count != Definition.Questions.Count || Definition.Questions.Any(question =>
            !answers.TryGetValue(question.Id, out var value) || value < Definition.MinValue || value > Definition.MaxValue)) return null;
        var score = answers.Values.Sum();
        var description = score <= 11
            ? "Začněte malým pokusem: upravte text a barvy na vlastní HTML stránce. Zjistíte, co vás baví."
            : score <= 18
                ? "Máte chuť objevovat. Vyberte si jeden drobný projekt a věnujte mu krátký pravidelný čas."
                : "Učení vás láká. Zkuste dokončit malou aplikaci a postupně přidávat další funkce.";
        return new(Guid.NewGuid(), DateTimeOffset.UtcNow, score, Definition.Questions.Count * Definition.MaxValue, description,
            Definition.Questions.Select(question => new AnswerResult(question.Id, question.Text, answers[question.Id])).ToArray());
    }
}
