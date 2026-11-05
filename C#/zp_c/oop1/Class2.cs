//using oop1;

//namespace oop1
//{
//     class Zvire
//    {
//        public int Hmotnost { get; protected set; }
//        public bool Leta { get { return Hmotnost < 9; } }

//        public Zvire(int hmotnost) { Hmotnost = hmotnost; }




//        public virtual string VratZvuk()
//        {
//            return "";
//        }

//        public void Nakrm(int hmotnost)
//        {
//            Hmotnost += hmotnost;
//        }

//        public override string ToString()
//        {
//            string typZvirete = Leta ? "Létavé" : "Nelétavé";
//            return string.Format("{0} zvíře {1} kg se zvukem: {2}", typZvirete, Hmotnost, VratZvuk());
//        }
//    }


//    class Pes : Zvire
//    {
//        public bool Obojek { get; private set; }

//        public Pes(int hmotnost, bool obojek) : base(hmotnost)
//        {
//            Obojek = obojek;
//        }




//        public override string VratZvuk()
//        {
//            return "Haf haf";
//        }
//}
//Zvire[] zvirata = new Zvire[3];

//zvirata[0] = new Pes(3, true);
//    zvirata[1] = new Kachna(1, "zelená");
//    zvirata[2] = new Kocka(5, 3);

//foreach (Zvire zvire in zvirata)
//{
//    Console.WriteLine(zvire.VratZvuk());
//}

//foreach (Zvire zvire in zvirata)
//{
//    Console.WriteLine(zvire);
//}
//Console.ReadKey();

//}
