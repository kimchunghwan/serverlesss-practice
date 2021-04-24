import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import * as csv from 'csv';
import { Client } from '@elastic/elasticsearch';
import {
  awsGetCredentials,
  createAWSConnection,
} from '@acuris/aws-es-connection';

const filePath = __dirname + '/../data/13_Tokyo_20053_20203.csv';
// const elasticSearchEndPoint = 'http:localhost:9200';
const elasticSearchEndPoint = 'https://search-es-with-cognito-547otdh65f2pll747f4sryzkfe.ap-northeast-1.es.amazonaws.com';

declare type Document = {
  No: string,
  種類: string,
  地域: string,
  市区町村コード: string,
  都道府県名: string,
  市区町村名: string,
  地区名: string,
  '最寄駅：名称': string,
  '最寄駅：距離': string,
  '取引価格（総額）': string,
  坪単価: string,
  間取り: string,
  面積: string,
  取引価格: string,
  土地の形状: string,
  間口: string,
  延床面積: string,
  建築年: string,
  建物の構造: string,
  用途: string,
  今後の利用目的: string,
  '前面道路：方位': string,
  '前面道路：種類': string,
  '前面道路：幅員': string,
  都市計画: string,
  建ぺい率: string,
  容積率: string,
  取引時点: string,
  改装: string,
  取引の事情等: string,
}

function sliceArray<T>(array: T[], size: number): T[][] {
  const result = [];
  let index = 0;
  while (index < array.length) {
    result.push(array.slice(index, index + size));
    index += size;
  }
  return result;
}
const convert = () => {
  return new Promise((resolve, reject) => {
    let datas = [];
    const stream = fs
      .createReadStream(filePath)
      .pipe(iconv.decodeStream('SJIS'))
      .pipe(iconv.encodeStream('UTF-8'))
      .pipe(csv.parse())
      .pipe(
        csv.transform(async (record) => {
          const data:Document = {
            No: record[0],
            種類: record[1],
            地域: record[2],
            市区町村コード: record[3],
            都道府県名: record[4],
            市区町村名: record[5],
            地区名: record[6],
            '最寄駅：名称': record[7],
            '最寄駅：距離': record[8],
            '取引価格（総額）': record[9],
            坪単価: record[10],
            間取り: record[11],
            面積: record[12],
            取引価格: record[13],
            土地の形状: record[14],
            間口: record[15],
            延床面積: record[16],
            建築年: record[17],
            建物の構造: record[18],
            用途: record[19],
            今後の利用目的: record[20],
            '前面道路：方位': record[21],
            '前面道路：種類': record[22],
            '前面道路：幅員': record[23],
            都市計画: record[24],
            建ぺい率: record[25],
            容積率: record[26],
            取引時点: record[27],
            改装: record[28],
            取引の事情等: record[29],
          };
          datas.push(data);
        })
      );
    let count = 0;
    stream.on('data', (chunk) => {
      count++;
    });
    stream.on('end', async () => {
      console.log(datas[0]);
      console.log(`${count}回に分けて取得しました`);
      resolve(datas);
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });
};
convert().then(async (data: Document[]) => {
  console.log(data[0]);
  console.log(data.length);
  const awsCredentials = await awsGetCredentials();
  const awsConnection = createAWSConnection(awsCredentials);
  const client = new Client({ ...awsConnection, node: elasticSearchEndPoint });

  for (const docs of sliceArray(data, 100)){
    // 配列をsliceしてbulk
    await client.bulk({
      index: 'test',
      body: docs.flatMap((doc) => [{ index: { _id: doc.No } }, doc]),
      refresh: 'wait_for',
    });
  }
});
