<template>
  <div class="report-create-container">
    <div class="report-page-title"><h1>신고접수 수정</h1></div>
    <div class="report-write">
      <div class="report-box titleName">
        <div class="report-subtitle"><h5 style="margin: 0px">제목</h5></div>
        <div class="report-inputbox">
          <input type="text" v-model="report.title" />
        </div>
      </div>
      <div class="report-box content">
        <div class="report-subtitle"><h5 style="margin: 0px">신고내용</h5></div>
        <div class="report-inputbox">
          <textarea
            name="content"
            rows="5"
            cols="40"
            v-model="report.content"
          ></textarea>
          <!-- <input type="text" v-model="report.content" /> -->
        </div>
      </div>
      <div class="report-box attachment">
        <div class="report-subtitle"><h5 style="margin: 0px">파일첨부</h5></div>
        <div class="report-filebox">
          <div class="report-file-list">
            <div class="report-file-list-name">
              <div
                v-for="(image, index) in imageList"
                :key="index"
                :class="{ 'deleted-file': image?.id in removeFilesList }"
              >
                {{ image?.imageName }}
                <i @click="deleteFile(image?.id)" class="fas fa-backspace"></i>
              </div>
              <div v-for="(file, index) in selectedFiles" :key="index">
                {{ file.name }}
                <i
                  @click="unselectFile(file.name)"
                  class="fas fa-backspace"
                ></i>
              </div>
            </div>
          </div>
          <div class="report-file-attach">
            <div class="search-btn">
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                style="display: none"
                multiple
                @change="upload($event)"
              />
              <button @click="$refs.fileInput.click()">파일 찾기</button>
            </div>
            <div class="attach-notice">
              <p>* 첨부파일 용량은 최대 10MB를 초과할 수 없습니다.</p>
              <p>
                * 첨부 가능 파일 : JPG, GIF, JPEG, PEG, PNG, DOC, HUN, HWP, PDF,
                DOCX, PPT, PPTX, PTF
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="report-empty-box-bottom"></div>

    <div class="report-btn">
      <button class="cancel-btn" @click="goBack">취소</button>
      <button class="ok-btn" @click="updateReport()">수정</button>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, defineComponent } from 'vue'
import router from '@/router/index'
import axios from '@/types/apiClient'
import store from '@/store/index'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'parkReportUpdate',
  setup() {
    const route = useRoute()
    const report_id = route.params.report_id
    const imageList = ref<[]>([])
    const removeFilesList = ref<string[]>([])

    const facility_id = computed(() => store.getters['auth/facilityId'])

    const nowUnderroad = computed(() => store.getters.nowUnderroad).value

    const apiClient = axios.apiClient(store)
    const api = axios.api

    let report = ref({
      name: '',
      phone: '',
      boardPassword: '',
      title: '',
      content: '',
      uploadedfiles: null
    })

    const fileInputRef = ref<HTMLInputElement | null>(null)
    const selectedFiles = ref<File[]>([]) // 담긴 첨부파일을 저장할 변수
    // FormData 객체 만들기
    let formData = new FormData()

    // 기존 접수글 데이터 가져와서 저장
    function getReportData() {
      apiClient
        .get(`/reports/apart/ApartBoard/detail/${report_id}`)
        .then((res) => {
          imageList.value = res.data.imageList
          console.log('기존 첨부파일 리스트: ', imageList.value)
          report.value.name = res.data.board.name
          report.value.phone = res.data.board.phone
          report.value.title = res.data.board.title
          report.value.content = res.data.board.content
        })
        .catch((err) => console.log(err))
    }

    // 사용자가 첨부한 파일들 저장
    function upload(event: any) {
      console.log('파일 저장함수 실행?')
      const files = event.target.files
      if (files && files.length > 0) {
        for (const file of files) {
          selectedFiles.value.push(file)
        }
        console.log(selectedFiles.value)

        // formData에 데이터 잘 들어가는지 확인
        // for (const values of formData.values()) {
        //   console.log(values)
        // }
      }
    }

    // 담긴 첨부파일들의 이름을 반환
    const getSelectedFileNames = computed(() => {
      const selectedFileNames = Array.from(selectedFiles.value)
        .map((file: any) => file.name)
        .join(', ')

      return selectedFileNames
    })
    // 기존에 있던 첨부파일에서 파일 제거
    function deleteFile(image_id: any) {
      // 제거할 리스트에 이미 들어있다면 중단
      for (let imageId of removeFilesList.value) {
        if (image_id === imageId) {
          return
        }
      }
      // 제거할 파일 리스트에 이미지id를 넣고, 수정 전 파일리스트인 imageList에서 찾아 없애준다.
      removeFilesList.value.push(image_id)
      for (let image of imageList.value) {
        if (image['id'] === image_id) {
          imageList.value.splice(imageList.value.indexOf(image), 1)
          break
        }
      }
      console.log('첨부파일 리스트: ', imageList.value)
      console.log('삭제할 이미지 id 리스트: ', removeFilesList.value)
    }

    function unselectFile(file_name: any) {
      for (let file of selectedFiles.value) {
        if (file.name === file_name) {
          selectedFiles.value.splice(selectedFiles.value.indexOf(file), 1)
          break
        }
      }
      console.log(selectedFiles.value)
    }

    function goBack() {
      router.go(-1)
    }

    // 신고접수 등록
    async function updateReport() {
      // FormData에 양식에 채워진 값들 넣기 (필수값)
      formData.append('name', report.value.name)
      formData.append('title', report.value.title)
      formData.append('content', report.value.content)

      // FormData에 삭제할 첨부파일의 id 담아주기
      for (let value of removeFilesList.value) {
        console.log(value)
        formData.append('removefiles', value)
      }

      // formData에 첨부파일 넣기
      for (let file of selectedFiles.value) {
        formData.append('addUploadedfiles', file)
      }

      // formData 의 밸류값을 확인하는 방법
      for (let values of formData.entries()) {
        console.log(values[0] + ', ' + values[1])
      }

      // 신고접수 수정하는 요청보내기
      await apiClient
        .post(`/reports/apartMember/update/${report_id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then((response) => {
          router.push(`/park/report/${report_id}/detail`)
        })
        .catch(function (error) {
          console.log(error)
          console.log(error.response.data.exception)
          if (
            error.response.data.exception == '수정할 수 있는 권한이 없습니다.'
          ) {
            alert('본인이 작성한 글이 아닙니다.')
            router.go(-1)
          }
        })
    }
    onMounted(() => {
      getReportData()
    })
    return {
      report,
      imageList,
      fileInputRef,
      selectedFiles,
      removeFilesList,
      upload,
      deleteFile,
      unselectFile,
      getSelectedFileNames,
      goBack,
      updateReport,
      getReportData
    }
  }
})
</script>

<style scoped>
.report-create-container {
  width: 100%;
}

.report-page-title {
  color: #000;
  text-align: center;
  /* font-family: Roboto; */
  font-size: 30px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px; /* 53.333% */
  letter-spacing: 3px;
  border-bottom: 2px solid black;
}

.report-page-title h1 {
  /* font-family: Roboto; */
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px; /* 53.333% */
  letter-spacing: 3px;
}

.report-empty-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 55px;
}
.report-empty-box-bottom {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 40px;
}

/* 각 입력 컬럼 */
.report-box {
  display: flex;
  border-bottom: 1px solid #939393;
}

/* 각 컬럼명 */
.report-subtitle {
  width: 90px;
  border-right: 1px solid #939393;
  padding: 10px 10px;
}

.report-inputbox {
  padding: 10px 10px;
}

/* .report-file-list-name {
  border: 1px solid #939393;
  padding: 10px;
  color: #939393;
  text-align: start;
} */

.report-file-list > .report-file-list-name {
  width: 800px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 20%);
  /* background: rgba(217, 217, 217, 0); */
  /* border: 1px solid #939393; */
  padding: 10px;
  /* height: 28px; */
  /* color: #939393; */
  text-align: start;
}

.report-filebox {
  display: flex;
  flex-direction: column;
}

.report-filebox > div {
  padding: 10px;
}

.report-file-attach {
  display: flex;
}

.search-btn > button {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.4);
  background: rgba(217, 217, 217, 0);
}

.search-btn {
  width: 93px;
  height: 36px;
  flex-shrink: 0;
}

.attach-notice {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  margin-bottom: 20px;
}

.attach-notice > p {
  font-size: 8px;
  text-align: start;
  margin: 0px;
  padding-left: 10px;
}

.report-create-container h5 {
  color: #000;
  text-align: center;
  /* font-family: Roboto; */
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 28px;
  letter-spacing: 0.25px;
  margin: 0px, 0px;
}

/* 하단 버튼 */
.report-btn {
  margin-top: 10px;
}

.report-btn > button {
  margin: 10px;
}

.search-btn > button {
  width: 100%;
  height: 100%;
  background-color: white;
}

.attach-notice > p {
  font-size: 8px;
  text-align: start;

  padding-left: 10px;
}

i {
  cursor: pointer;
}

.cancel-btn {
  display: flex;
  width: 90px;
  height: 32px;
  padding: 11px 16px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background: var(--unnamed, #939393);
  color: #fff;
  text-align: center;
  /* Button */
  /* font-family: Roboto; */
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 142.857% */
  letter-spacing: 1.25px;
  text-transform: uppercase;
  border: 0;
}

.ok-btn {
  display: flex;
  width: 90px;
  height: 32px;
  padding: 11px 16px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background: var(--1, #10316b);
  color: #fff;
  text-align: center;
  /* Button */
  /* font-family: Roboto; */
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 142.857% */
  letter-spacing: 1.25px;
  text-transform: uppercase;
  border: 0;
}

.report-btn > button {
  margin: 10px;
}

.search-btn > button {
  width: 100%;
  height: 100%;
  background-color: white;
}

.attach-notice > p {
  font-size: 8px;
  text-align: start;

  padding-left: 10px;
}

input {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 20%);
  background: rgba(217, 217, 217, 0);
  margin: 10px;
}
textarea {
  width: 800px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 20%);
  background: rgba(217, 217, 217, 0);
  margin: 10px;
}

.report-create-container {
  width: 90%;
}
</style>
