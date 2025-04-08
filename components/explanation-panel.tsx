import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExplanationPanelProps {
  currentStep: number;
  animationPhase: number;
}

export function ExplanationPanel({
  currentStep,
  animationPhase,
}: ExplanationPanelProps) {
  const explanations = [
    {
      title: "Начално състояние",
      phases: [
        "Текстът в обикновен вид се подрежда в 4×4 матрица от байтове, наречена състояние. Всяка клетка съдържа един байт (8 бита) данни.",
        "Байтовете се подреждат колона по колона. Например, първата колона съдържа първия, петия, деветия и тринадесетия символ от текста.",
        "Тази матрична репрезентация позволява на AES да извършва операции върху данните по структуриран начин.",
      ],
    },
    {
      title: "Добавяне на кръгъл ключ (Начално)",
      phases: [
        "Първият кръгъл ключ (изведен от оригиналния ключ) се подрежда в 4×4 матрица, подобна на матрицата на състоянието.",
        "Всеки байт от състоянието се XOR-ва с съответния байт от кръглия ключ. XOR е побитова операция, която дава 1, ако входовете са различни, и 0, ако са еднакви.",
        "Тази операция ефективно смесва ключа със състоянието, с което започва процесът на криптиране.",
      ],
    },
    {
      title: "SubBytes",
      phases: [
        "Всеки байт в състоянието се заменя със съответната му стойност от AES S-кутията (Substitution box).",
        "S-кутията е нелинейна таблица за замяна, която създава объркване в шифъра, правейки го устойчив на атаки.",
        "Тази замяна добавя нелинейност към шифъра, което е от решаващо значение за сигурността.",
      ],
    },
    {
      title: "ShiftRows",
      phases: [
        "Редовете на състоянието се изместват циклично наляво с различен брой позиции.",
        "Ред 0 не се измества, ред 1 се измества с 1 позиция, ред 2 с 2 позиции, а ред 3 с 3 позиции.",
        "Тази операция осигурява разсейване (diffusion), като гарантира, че байтовете от всяка колона се разпределят в различни колони.",
      ],
    },
    {
      title: "MixColumns",
      phases: [
        "Всяка колона на състоянието се третира като полином и се умножава с фиксиран полином.",
        "Това е матрично умножение, което комбинира четирите байта във всяка колона.",
        "MixColumns гарантира, че промяната в един байт влияе върху всички четири байта в колоната, осигурявайки допълнително разсейване.",
      ],
    },
    {
      title: "Добавяне на кръгъл ключ",
      phases: [
        "Кръглият ключ за текущия кръг се извежда чрез алгоритъма за генериране на ключове (key schedule).",
        "Всеки байт от състоянието се XOR-ва със съответния байт от кръглия ключ.",
        "Тази операция включва кръглия ключ в състоянието, добавяйки още един слой сигурност.",
      ],
    },
    {
      title: "Повтаряне още 8 пъти",
      phases: [
        "Процесът на SubBytes, ShiftRows, MixColumns и AddRoundKey се повтаря още 8 пъти.",
        "Всеки кръг използва различен кръгъл ключ, изведен от оригиналния ключ.",
        "Многократното повтаряне на тези операции осигурява високо ниво на сигурност.",
      ],
    },
    {
      title: "Финал - SubBytes",
      phases: [
        "В последния кръг отново се извършва операцията SubBytes.",
        "Всеки байт се заменя със съответната стойност от S-кутията.",
        "Това продължава да добавя нелинейност към шифъра.",
      ],
    },
    {
      title: "Финал - ShiftRows",
      phases: [
        "Операцията ShiftRows се изпълнява отново в последния кръг.",
        "Редовете се изместват със съответните им отмествания, както и в предишните кръгове.",
        "Това гарантира продължаващо разсейване на данните.",
      ],
    },
    {
      title: "Финал - Добавяне на кръгъл ключ",
      phases: [
        "Финалният кръгъл ключ се XOR-ва със състоянието.",
        "Забележете, че в последния кръг не се включва MixColumns — това е основна разлика спрямо останалите кръгове.",
        "Това опростява процеса на декриптиране, като същевременно запазва сигурността.",
      ],
    },
    {
      title: "Шифъртекст",
      phases: [
        "Финалната матрица на състоянието е криптираният шифъртекст.",
        "Матрицата обикновено се преобразува обратно в последователност от байтове за предаване или съхранение.",
        "Тези данни вече са защитени и могат да бъдат декриптирани само с правилния ключ.",
      ],
    },
    {
      title: "Завършено",
      phases: [
        "Процесът на AES-128 криптиране е завършен.",
        "Текстът в обикновен вид е трансформиран в шифъртекст чрез 10 кръга на обработка.",
        "AES-128 се счита за сигурен срещу всички известни атаки, когато е правилно имплементиран.",
      ],
    },
  ];

  const currentExplanation = explanations[currentStep];
  const currentPhaseText =
    currentExplanation.phases[
      Math.min(animationPhase, currentExplanation.phases.length - 1)
    ];

  // Color mapping for different operations
  const getOperationColor = (title: string) => {
    if (title.includes("Начално състояние")) return "rgb(59, 130, 246)"; // blue
    if (title.includes("Добавяне на кръгъл ключ")) return "rgb(16, 185, 129)"; // green
    if (title.includes("SubBytes")) return "rgb(249, 115, 22)"; // orange
    if (title.includes("ShiftRows")) return "rgb(236, 72, 153)"; // pink
    if (title.includes("MixColumns")) return "rgb(139, 92, 246)"; // purple
    if (title.includes("Шифъртекст")) return "rgb(234, 179, 8)"; // yellow
    if (title.includes("Повтаряне")) return "rgb(107, 114, 128)"; // gray
    return "rgb(255, 255, 255)"; // white
  };

  const operationColor = getOperationColor(currentExplanation.title);

  return (
    <Card className="bg-gray-800/60 border-gray-700 h-full">
      <CardHeader
        className="pb-2"
        style={{ borderBottom: `2px solid ${operationColor}` }}
      >
        <CardTitle className="text-xl" style={{ color: operationColor }}>
          {currentExplanation.title}
        </CardTitle>
        <div className="flex gap-1 mt-2">
          {currentExplanation.phases.map((_, index) => (
            <div
              key={index}
              className="h-1.5 flex-1 rounded-full"
              style={{
                opacity: index <= animationPhase ? 1 : 0.4,
                backgroundColor:
                  index <= animationPhase ? operationColor : "rgb(75, 85, 99)",
              }}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-gray-200 text-lg leading-relaxed">
          {currentPhaseText}
        </p>
      </CardContent>
    </Card>
  );
}
