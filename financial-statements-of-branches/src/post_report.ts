import { IItogText } from './types.ts';

import express from "express";

const app = express()
const port = 3000
app.use(express.json())
app.use(express.urlencoded({extended: true}))



export default async function edit_post_request() {

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })


  app.post("/", async (req, res) => {
    console.log(req.body)

    let rez = await post_result(req.body);
    console.log(rez);

    // res.status(200).send({ "message": rez})
    res.status(200).send({ rez })
  })
}





// export default async function post_result(dp_filial_post: any) {
async function post_result(dp_filial_post: any) {

  let filial: string | any[] = [];

  let dlinaJson = Object.keys(dp_filial_post).length

  for (let i = 0; i < dlinaJson / 3; i++) {
    filial[i] = [dp_filial_post["id_filial_" + (i+1)], dp_filial_post["timezone_filial_" + (i+1)], dp_filial_post["ccy_filial_" + (i+1)]]
    // filial[i] = [dp_filial_post[i * 3], dp_filial_post[i * 3 + 1], dp_filial_post[i * 3 + 2]];
    // filial[i][0] = dp_filial_post["id_filial_"+(i+1)];
    // filial[i][1] = dp_filial_post["timezone_filial_"+(i+1)];
    // filial[i][2] = dp_filial_post["ccy_filial_"+(i+1)];
  }

  // Загружаем конвертер
    let converter = await fetch(
    'https://v6.exchangerate-api.com/v6/9b457121ae4a356fb8990006/latest/' +
    filial[0][2],
  )
    .then((response) => response.json())
    // .then((json) => console.log(json["title"]));
    .then((json) => json);

  //Создаем переменные для обработки
  // rashod[id] = [year, month, date, hour, id_filial, id category, ccy, base_ccy]
  let rashod: string | any[] = [];

  let date: Date = new Date(2025, 0, 1, 0, 0, 0);
  let random_filial;
  let rashod_ccy;
  let cathegory_rashod = 5;
  let month_rashod_ccy = 0;

  // Заполняем расходы
  for (let i = 0; i < 24 * 30 * 4; i++) {
    random_filial = getRandomInt(0, filial.length - 1);
    rashod_ccy = getRandomInt(0, 100);

    if (random_filial == 0) {
      rashod[i] = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), random_filial, getRandomInt(0, cathegory_rashod), rashod_ccy, rashod_ccy];
    } else {
      date.setHours(date.getHours() + parseInt(filial[random_filial][1]));
      rashod[i] = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), random_filial, getRandomInt(0, cathegory_rashod), rashod_ccy, Number(rashod_ccy/converter["conversion_rates"][filial[random_filial][2]]).toFixed()]
      date.setHours(date.getHours() - parseInt(filial[random_filial][1]));
    }
    date.setHours(date.getHours() + 1);
  }

  //генератор чисел для заполнения расходов
  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  //Создаем массив для суммирования расходов
  let all_rashod: number[] = [];
  all_rashod.length = filial.length;
  for (let i = 0; i < filial.length; i++) {all_rashod[i] = 0;}

  // Суммируем расход по филлиалам
  let total_all_filial: number = 0;
  function all_rashod_base_ccy() {
    for (let i = 0; i < rashod.length; i++) {
      if (rashod[i][1] == month_rashod_ccy) {
        all_rashod[rashod[i][4]] = all_rashod[rashod[i][4]] + parseInt(rashod[i][7]);
        total_all_filial = total_all_filial + parseInt(rashod[i][7]);
      }
    }

    return all_rashod;
  }

  let cathegory: number[] = [];
  cathegory.length = cathegory_rashod;
  for (let i = 0; i < cathegory_rashod + 1; i++) {
    cathegory[i] = 0;
  }
  //Суммируем расход по категориям для филиалла
  function all_rashod_cathegory(id_filial: number) {
    for (let i = 0; i < rashod.length; i++) {
      if (id_filial == rashod[i][4] && rashod[i][1] == month_rashod_ccy) {
        cathegory[rashod[i][5]] = cathegory[rashod[i][5]] + parseInt(rashod[i][7]);
      }
    }

    return cathegory;
  }

  let month_all: string[] = ["январь", "февраль", "март", "апрель", "май", "июнь"]


  let itogText: IItogText = {
    "Отчет за месяц": month_all[month_rashod_ccy],
    "Расход по всем филиалам в базовой валюте": all_rashod_base_ccy() + ' ' + filial[0][2],
    "Расход общий по всем филиалам в базовой валюте": total_all_filial + ' ' + filial[0][2],
  };

  for (let i = 0; i < filial.length; i++) {
    itogText['Отчет по филиалу ' + filial[i][0]] = filial[i][0];
    itogText['Плановый бюджет филиала ' + filial[i][0]] = Number(total_all_filial / filial.length).toFixed(0);
    itogText['Израсходовано филиала ' + filial[i][0]] = Number(all_rashod[i]);
    itogText['Эконом эффект филиала ' + filial[i][0]] = Number(total_all_filial / filial.length - all_rashod[i]).toFixed(0);

    all_rashod_cathegory(i);

    itogText['Oтчет по категориям для филиала ' + filial[i][0]] = filial[i][0];

    for (let y = 0; y < cathegory.length; y++) {
      itogText['Филиал ' + filial[i][0] + '. Категория расхода ' + y] = Number(cathegory[y]);
    }
  }

  // res.status(200).send({"message": "rez"})


  // console.log(itogText);
  return itogText;

}
