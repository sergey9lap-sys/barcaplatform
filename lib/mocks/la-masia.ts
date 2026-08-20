import type { LaMasiaPlayerRecord } from "@/types/database";

export const mockLaMasiaPlayers: LaMasiaPlayerRecord[] = [
  {
    id: "xavi-espart", name: "Хави Эспарт", age: 19, position: "Правый защитник / опорник",
    image_url: "/la-masia/xavi-espart.png", team_level: "Barca Atletic", potential_score: 91,
    first_team_chance: 86, coach_system_fit_score: 92, barca_fit_score: 94, status: "first_team_candidate",
    short_description: "Гибридный профиль для правого фланга и центра: умно занимает пространство, спокойно работает с мячом и уже выдерживает темп первой команды.", priority: 100,
  },
  {
    id: "alvaro-cortes", name: "Альваро Кортес", age: 21, position: "Центральный защитник",
    image_url: "/la-masia/alvaro-cortes.jpg", team_level: "Barca Atletic", potential_score: 84,
    first_team_chance: 79, coach_system_fit_score: 86, barca_fit_score: 88, status: "first_team_candidate",
    short_description: "Левоногий центральный защитник с хорошим первым пасом, игрой на опережение и физикой для взрослого футбола.", priority: 90,
  },
  {
    id: "jordi-pesquer", name: "Жорди Пескер", age: 17, position: "Левый защитник",
    image_url: "/la-masia/jordi-pesquer.jpg", team_level: "U19", potential_score: 90,
    first_team_chance: 72, coach_system_fit_score: 87, barca_fit_score: 91, status: "preseason",
    short_description: "Атакующий левый защитник ростом 183 см: даёт ширину, уверенно продвигает мяч и уже привлекался к тренировкам команды Флика.", priority: 89,
  },
  {
    id: "brian-farinas", name: "Брайан Фариньяс", age: 20, position: "Центральный полузащитник",
    image_url: "/la-masia/brian-farinas.jpg", team_level: "Barca Atletic", potential_score: 86,
    first_team_chance: 76, coach_system_fit_score: 89, barca_fit_score: 92, status: "preseason",
    short_description: "Универсальный полузащитник с большим объёмом работы, культурой паса и привычкой управлять темпом матча.", priority: 88,
  },
  {
    id: "alex-gonzalez", name: "Алекс Гонсалес", age: 18, position: "Левый вингер / нападающий",
    image_url: "/la-masia/alex-gonzalez.jpg", team_level: "Barca Atletic", potential_score: 87,
    first_team_chance: 68, coach_system_fit_score: 84, barca_fit_score: 86, status: "preseason",
    short_description: "Вертикальный атакующий игрок, способный начинать широко и заходить в штрафную. Один из самых результативных выпускников Juvenil A.", priority: 84,
  },
  {
    id: "ebrima-tunkara", name: "Эбрима Тункара", age: 16, position: "Атакующий полузащитник / вингер",
    image_url: "/la-masia/ebrima-tunkara.jpg", team_level: "U19", potential_score: 95,
    first_team_chance: 67, coach_system_fit_score: 90, barca_fit_score: 96, status: "preseason",
    short_description: "Левша с редким сочетанием техники, ускорения и физической мощи. Может играть между линиями или атаковать с правого фланга.", priority: 98,
  },
  {
    id: "orian-goren", name: "Ориан Горен", age: 17, position: "Центральный / атакующий полузащитник",
    image_url: "/la-masia/orian-goren.jpg", team_level: "U19", potential_score: 91,
    first_team_chance: 62, coach_system_fit_score: 88, barca_fit_score: 95, status: "watch",
    short_description: "Технический полузащитник с видением поля и чувством комбинации. Особенно опасен между линиями и при поздних подключениях.", priority: 92,
  },
  {
    id: "iker-rodriguez", name: "Икер Родригес", age: 18, position: "Вратарь",
    image_url: "/la-masia/iker-rodriguez.jpg", team_level: "Barca Atletic", potential_score: 88,
    first_team_chance: 64, coach_system_fit_score: 85, barca_fit_score: 89, status: "preseason",
    short_description: "Высокий современный вратарь: уверенно начинает атаки ногами, хорошо читает глубину и уже работает в динамике первой команды.", priority: 82,
  },
  {
    id: "hamza-abdelkarim", name: "Хамза Абделькарим", age: 18, position: "Центральный нападающий",
    image_url: "/la-masia/hamza-abdelkarim.jpg", team_level: "Barca Atletic", potential_score: 92,
    first_team_chance: 74, coach_system_fit_score: 86, barca_fit_score: 88, status: "preseason",
    short_description: "Мобильная девятка, которая связывает атаки и чувствует момент для рывка в штрафную. Сильный кандидат на быстрый переход во взрослый футбол.", priority: 94,
  },
];
