//using System;
//using System.Collections.Generic;
//using System.Text;

//namespace oop1
//{
//    //internal class Clovek
//    //{
//    //    //protected string Jmeno; // atribut jmeno - chraneny modifikator pristupu
//    //    public string Jmeno { get; set; } // atribut jmeno - verejny modifikator pristupu


//    //    public int vek; // atribut vek - privatni modifikator pristupu

//    //    public int GetVek()
//    //    {
//    //        return vek;
//    //    }
//    //    public void SetVek(int vek)
//    //    {
//    //        if (vek >= 0) // kontrola, zda je vek kladny
//    //        {
//    //            this.vek = vek;
//    //        }
//    //        else
//    //        {
//    //            Console.WriteLine("Vek nemuze byt zaporny");
//    //        }
//    //    }
//    //    /**
//    //     * metoda vraci  jmeno cloveka
//    //     */
//    //    public virtual string Pozdrav(String text, String info)
//    //    {
//    //        Console.WriteLine("Ahoj, ja jasem " + Jmeno );
//    //        return text + info;
//    //    }

//    //    //internal void Jmeno(string v)
//    //    //{
//    //    //    Jmeno = v;
//    //    //}

//    public virtual class Clovek
//    {
//        static void Main(string[] args)
//        {
//            Clovek petr = new Clovek("petr", 25);

//            Programator tomas = new Programator("tomas", 30, "csharp");

//            // Console.WriteLine(tomas.VratPozdrav());

//            //List<Clovek> lide = new List<Clovek>();

//            //lide.Append(tomas);
//            //lide.Append(petr);

//            Clovek[] lide =
//            {
//            new Clovek("petr", 25),
//            new Programator("tomas", 30, "csharp")
//        };


//            foreach (Clovek clovek in lide)
//            {
//                Console.WriteLine(clovek.VratPozdrav());
//                Console.WriteLine("\n");
//                Console.WriteLine(clovek.ToString());
//            }

//            //try
//            //{
//            //    Console.WriteLine(((Programator)lide[1]).Jazyk);
//            //}
//            //catch (Exception ex)
//            //{

//            //    Console.WriteLine($"Nelze vypsat jazyk {ex}");
//            //}



//        }
//    }



//}
//}
