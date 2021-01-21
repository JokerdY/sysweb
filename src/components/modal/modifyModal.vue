<template>
  <div>
    <Modal
        v-model="modal"
        title="修改记录"
        @on-ok="modifyOk"
        @on-cancel="modifyCancel">
      <Form ref="modifyForm" :model="modifyForm" :rules="addRules" :label-width="80" inline>
        <FormItem label="消费类型" prop="type">
          <Select v-model="modifyForm.type" style="width:150px">
            <Option v-for="item in typeDict" :value="item.convertName" :key="item.rowId">
              {{ item.convertName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="消费金额" prop="consumptionAmount">
          <Input v-model="modifyForm.consumptionAmount"
                 placeholder="请输入金额"
                 style="width: 150px"/>
        </FormItem>
        <FormItem label="收入支出">
          <Switch true-color="#13ce66" false-color="#ff4949"/>
          <i-switch true-color="#13ce66" false-color="#ff4949" v-model="modifyForm.incomeExpenditure" size="large">
            <span slot="open">收入</span>
            <span slot="close">支出</span>
          </i-switch>
        </FormItem>
        <br/>
        <FormItem label="消费日期" prop="date">
          <DatePicker type="date"
                      format="yyyy-MM-dd"
                      :value="modifyForm.date"
                      @on-change="modifyForm.date = $event"
                      show-week-numbers
                      placeholder="请选择消费日期"/>
        </FormItem>
        <FormItem label="备注" prop="content">
          <Input v-model="modifyForm.content"
                 maxlength="100"
                 show-word-limit
                 type="textarea"
                 placeholder="输入备注信息"
                 style="width: 390px"/>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "modifyModal",
  props: {
    modifyModal: {
      type: Boolean,
      default: false
    },
    modifyList: {
      type: Object,
      default: () => {
      }
    },
    typeDict: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    modifyModal(value) {
      this.modal = value
      this.modifyForm = this.modifyList
    },
  },
  data() {
    return {
      addRules: {},
      modal: this.modifyModal,
      modifyForm: this.modifyList,
    }
  },
  methods: {
    async modifyOk() {
      // 消费类型转换
      let type = this.typeDict.filter(s => {
        return s.convertName === this.modifyForm.type
      }).map(s => s.rowId)[0];
      // 获取用户id
      let userId = this.cookie.getCookie("userId")
      // 收入支付判断
      if (!this.modifyForm.incomeExpenditure) {
        this.modifyForm.consumptionAmount *= -1
      }
      let params = new URLSearchParams();
      params.append('date', this.modifyForm.date)
      params.append('consumptionAmount', this.modifyForm.consumptionAmount)
      params.append('content', this.modifyForm.content)
      params.append('type', type);
      params.append('userId', userId)
      params.append("id", this.modifyForm.id)
      await axios.post('/financial/update', params)
          .then(res => {
            if (res.data.status === 'success') {
              this.$Message['success']({
                background: true,
                content: '更新成功'
              });
              console.log(res)
            }
          }).catch(err => {
            this.$Message['error']({
              background: true,
              content: '更新失败'
            });
            console.log(err)
          })
      this.$emit('refresh', 1)
      this.modifyCancel()
    },
    modifyCancel() {
      this.modal = false;
    },
  }
}
</script>

<style scoped>

</style>