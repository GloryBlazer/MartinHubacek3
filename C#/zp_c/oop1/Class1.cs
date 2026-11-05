namespace nakladak
{
    internal class Nakladak
    {
        int hmotnost = 21000;
        int naklad = 1000;
        public void Naloz(int naklad)
        {
            hmotnost += naklad;
            Console.WriteLine("Nakladak s nakladem " + naklad + " s hmotnosti: " + hmotnost + " kg");
        }
        public void Vyloz(int naklad)
        {
            if (naklad >= 0) hmotnost -= naklad;
            Console.WriteLine("Nakladak s nakladem " + naklad + " vylozen s hmotnosti: " + hmotnost + " kg");
        }
        public void vypisHmotnost(int hmotnost)
        {
            Console.WriteLine("Aktualni hmotnost nakladaku: " + hmotnost + " kg");
        }

    }
}
