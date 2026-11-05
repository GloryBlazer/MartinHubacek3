namespace ukol12lekce
{
    internal class Program
    {
        static void Main(string[] args)
        {

            Console.WriteLine("Výpočet průměru známek");
            Console.WriteLine("Zadejte známky oddělené čárkou:");
            string? vstup = Console.ReadLine();
            if (string.IsNullOrWhiteSpace(vstup))
            {
                Console.WriteLine("Zadejte alespoň jednu známku.");
                return;
            }
            string[] znamky = vstup.Split(',');
            double pocetZnaku = 0;
            double soucetZnaku = 0;
            foreach (string znak in znamky)
            {
                if (!int.TryParse(znak.Trim(), out int znamka) || znamka < 1 || znamka > 5)
                {
                    Console.WriteLine("Známky musí být celá čísla od 1 do 5, oddělená čárkou.");
                    return;
                }
                soucetZnaku += znamka;
                pocetZnaku++;
            }
            double prumer = soucetZnaku / pocetZnaku;
            Console.WriteLine("Průměr známek: " + prumer);
        }
    }
}
