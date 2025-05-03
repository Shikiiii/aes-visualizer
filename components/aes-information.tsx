"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AesInformationProps {
    setIsShowingInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AesInformation({setIsShowingInfo}: AesInformationProps) {
    return (
        <div className="bg-gray-800/80 rounded-xl p-6 shadow-xl text-white max-w-2xl mx-auto">
            <Button onClick={() => setIsShowingInfo(false)} variant="outline" className="bg-gray-700">
            Назад
            </Button>

            <h2 className="text-2xl font-bold mb-4 pt-4">🔐 Какво е AES?</h2>
            <p className="mb-4">
            <b>AES (Advanced Encryption Standard)</b> е симетричен блоков шифър, който се използва за шифриране и дешифриране на данни. Това означава, че за криптиране и декриптиране се използва един и същ ключ. AES е един от най-широко използваните и надеждни алгоритми за криптиране в съвременния свят.
            </p>

            <h2 className="text-2xl font-bold mb-4 pt-4">🧬 Произход на AES</h2>
            <p className="mb-4">
            AES е приет през <b>2001 г.</b> от <b>Националния институт по стандарти и технологии на САЩ (NIST)</b>, като наследник на по-стария стандарт <b>DES (Data Encryption Standard)</b>.
            След международен конкурс, алгоритъмът <b>Rijndael</b>, създаден от белгийските криптографи <b>Винсънт Реймен</b> и <b>Йоан Дамен</b>, е избран и стандартизиран като AES.
            </p>

            <h2 className="text-2xl font-bold mb-4 pt-4">⚙️ Как работи AES и какви са неговите версии?</h2>
            <p className="mb-4">
            AES е <b>блоков шифър</b>, което означава, че обработва данни на блокове от <b>128 бита</b>. Съществуват три основни версии на AES, базирани на дължината на ключа:
            </p>
            <ul className="list-disc list-inside mb-4">
            <li><b>AES-128</b> – използва 128-битов ключ (10 рунда на криптиране)</li>
            <li><b>AES-192</b> – използва 192-битов ключ (12 рунда)</li>
            <li><b>AES-256</b> – използва 256-битов ключ (14 рунда)</li>
            </ul>
            <p className="mb-4">
            Колкото по-дълъг е ключът, толкова по-голяма е защитата, но и обработката е по-бавна.
            </p>

            <h2 className="text-2xl font-bold mb-4 pt-4">🌐 Къде се използва AES?</h2>
            <p className="mb-4">
            AES намира приложение почти навсякъде в съвременната дигитална сигурност:
            </p>
            <ul className="list-disc list-inside mb-4">
            <li>При <b>VPN връзки</b> и <b>TLS/SSL</b> (защитени уебсайтове)</li>
            <li>В <b>мобилни телефони</b> и <b>диск криптиране</b> (напр. BitLocker, FileVault)</li>
            <li>При <b>безжични мрежи (Wi-Fi)</b> чрез WPA2/WPA3</li>
            <li>В <b>банкови и финансови приложения</b></li>
            <li>В <b>съхранение и предаване на чувствителни данни</b></li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 pt-4">💡 Защо е полезно да познаваме AES?</h2>
            <ul className="list-disc list-inside mb-4">
            <li><b>Криптографията е основен стълб на цифровата сигурност</b> – независимо дали програмирате, работите в ИТ сигурност или просто се интересувате от технологии.</li>
            <li><b>AES е навсякъде</b> – познаването на начина му на работа ви прави по-добре подготвени да разбирате как реално се защитава информацията.</li>
            <li>Ако разработвате приложения или уебсайтове, <b>AES често е инструмент за защита на потребителски данни</b>.</li>
            <li>Познаването на AES може да ви помогне да <b>различавате сигурни от несигурни практики</b>.</li>
            </ul>
        </div>
    )
}