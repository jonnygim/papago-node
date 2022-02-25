const textAreaArray = document.querySelectorAll("textarea");
const formBox = document.querySelector(".Card__body__textarea");
console.log(formBox);
console.log(textAreaArray);

// 변수 네이밍 컨벤션, 도메인과 관련된 용어 정리
// source : 번역할 텍스트와 관련된 명칭
// target : 번역된 결과와 관련된 명칭

const [sourceTextArea, targetTextArea] = textAreaArray;
// console.log(sourceTextArea);
// console.log(targetTextArea);

const [sourceSelect, targetSelect] = document.querySelectorAll("select");
console.log(sourceSelect, targetSelect);

// 번역할 언어의 타입 (ko ? , en? , ja?)
let targetLanguage = "en";
// 'ko', 'ja'

// console.dir(targetSelect);
// console.log(targetSelect.options);
// console.log(targetSelect.options[targetSelect.selectedIndex].value);

// 어떤 언어로 번역할지 선택하는 target selectbox의 선택지 값이 바뀔 때마다 이벤트 발생
targetSelect.addEventListener("change", () => {
  const selectedIndex = targetSelect.selectedIndex;
  console.log(selectedIndex);

  targetLanguage = targetSelect.options[selectedIndex].value;
  console.log(targetLanguage);
});
// 내가 해본
// if(targetSelect.options[targetSelect.selectedIndex].value === 'ko') {
//     targetLanguage = 'ko';
// } else if (targetSelect.options[targetSelect.selectedIndex].value === 'ja') {
//     targetLanguage = 'ja';
// }

let debouncer;

formBox.addEventListener("input", (event) => {
  if (debouncer) {
    clearTimeout(debouncer);
  }

  debouncer = setTimeout(() => {
    const text = event.target.value;

    if (text) {
      // 이름이 XML 일 뿐이지, XML 에 국한되지 않음
      const xhr = new XMLHttpRequest();

      const url = "/detectLangs"; // node 로 보내야 함

      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          // 서버의 응답 결과 확인 (responseText :응답에 포함된 텍스트)
          //console.log(typeof xhr.responseText); // 항상 타입을 확인하라 . 객체 처럼 생겼는데 String 이면 JSON 이다.
          //console.log(xhr.responseText);
          const responseData = xhr.responseText;
          console.log(
            `responseData: ${responseData}, type: ${typeof responseData}`
          );

          // 두번 파싱해야하는 이유 https://stackoverflow.com/questions/30194562/json-parse-not-working/49460716
          const parsedData = JSON.parse(JSON.parse(responseData));
          console.log(typeof parsedData, parsedData);

          const result = parseJsonToObject['message']['result']; //?
          const options = sourceSelect.options;

          for(let i = 0; i < options.length; i++) {
            if(options[i].value === result['srcLangType']) {
              sourceSelect.selectedIndex = i;
            }
          }

          targetTextArea.value = result['translatedText'];
          // console.log(parsedData.message.result['srcLangType']);
          // console.log(parsedData.message.result['translatedText']);

          // 번역된 텍스트를 결과 화면에 출력
          // targetTextArea.value = parsedData.message.result["translatedText"];
          // sourceSelect.value = parsedData.message.result["srcLangType"];

          // 응답의 헤더(header) 확인
          //console.log(`응답 헤더 : ${xhr.getAllResponseHeaders()}`);
        }
      };

      /**
       * -> 이렇게 작성해도 됨
       * xhr.addEventListener('load', () { // 로딩이 완료되었을 때 실행
       *  if(xhr.status == 200) {
       *    // 내부 코드 동일
       *  }
       * });
       */


      xhr.open("POST", url);
      // 서버에 보내는 요청 데이터의 형식이 json 형식임을 명시
      xhr.setRequestHeader("Content-type", "application/json");

      // 객체로 보냄  (입력 텍스트, 번역할 언어 종류) 변수 이름으로 한줄로 쓰면 그대로 담김 (text:text, ...)
      const requestData = {
        // typeof : object
        text,
        targetLanguage,
      };

      // JSON(JavaScript Object Notation) 의 타입은 ? string
      // 따라서 보낼때 string 으로 변경해서 보내야 함 (직렬화)
      // 내장 모듈 JSON 활용
      // 서버에 보낼 데이터를 문자열화 시킴
      const jsonToString = JSON.stringify(requestData);
      //console.log(typeof jsonToString); // type:  string

      xhr.send(jsonToString);
    } else {
        alert('번역할 텍스트를 입력하세요');
    }
  }, 3000);
});
