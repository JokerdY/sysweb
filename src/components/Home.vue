<template>
  <div class="home">
    <Button icon="md-add" type="primary" ghost @click="addCommand">新增</Button>
    <Select clearable
            style="width:150px;float:right;"
            v-model="selectType"
            @on-change="getData(1,null)"
            @on-clear="getData(1,null)">
      <Option v-for="item in typeDict" :value="item.convertName" :key="item.rowId">
        {{ item.convertName }}
      </Option>
    </Select>
    <DatePicker type="date"
                show-week-numbers
                placeholder="选择查询日期"
                style="float: right"
                format="yyyy-MM-dd"
                value="yyyy-MM-dd"
                @on-change="selectDate = $event"
                @on-ok="getData(1,null)"
                @on-clear="getData(1,null)"
                @on-clickoutside="getData(1,null)"
                confirm
    />
    <Modal
        v-model="this.addModal"
        title="新增记录"
        @on-ok="addOk"
        @on-cancel="addCancel">
      <Form ref="addForm" :model="addForm" :rules="addRules" :label-width="80" inline>
        <FormItem label="消费类型" prop="type">
          <Select v-model="addForm.type" style="width:150px">
            <Option v-for="item in typeDict" :value="item.convertName" :key="item.rowId">
              {{ item.convertName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="消费金额" prop="consumptionAmount">
          <Input v-model="addForm.consumptionAmount"
                 placeholder="请输入金额"
                 style="width: 150px"/>
        </FormItem>
        <FormItem label="收入支出">
          <Switch true-color="#13ce66" false-color="#ff4949" />
<!--          <Switch-->
<!--                  true-color="#13ce66"-->
<!--                  false-color="#ff4949"-->
<!--                  @on-change="changeIncome($event)">-->

<!--          </Switch>-->
          <i-switch true-color="#13ce66" false-color="#ff4949" v-model="addForm.incomeExpenditure" size="large">
            <span slot="open">收入</span>
            <span slot="close">支出</span>
          </i-switch>
        </FormItem>
        <br/>
        <FormItem label="消费日期" prop="date">
          <DatePicker type="date"
                      format="yyyy-MM-dd"
                      value="yyyy-MM-dd"
                      @on-change="addForm.date = $event"
                      show-week-numbers
                      placeholder="请选择消费日期"/>
        </FormItem>
        <FormItem label="备注" prop="content">
          <Input v-model="addForm.content"
                 maxlength="100"
                 show-word-limit
                 type="textarea"
                 placeholder="输入备注信息"
                 style="width: 390px"/>
        </FormItem>
      </Form>
    </Modal>
    <br/>
    <br/>
    <Table border :loading="loading" :columns="titleColumns" :data="pageData"></Table>
    <div><span class="label">{{ this.$root.userName }}的当前可用余额为：{{ this.remainAmount }}元</span></div>
    <div><span class="label">
      <span v-if="selectDate===''">共计消费：</span>
      <span v-else>当天消费：</span>
      {{ this.dayConsumptionAmount }} 元</span></div>
    <br/>
    <Page :total="dataCount" :page-size="pageSize" show-total show-elevator class="paging"
          @on-change="changePage"
          @on-page-size-change="changePageSize"></Page>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'Home',
  data() {
    return {
      // 消费类型
      typeDict: [{convertName: '', rowId: ''}],
      // 筛选日期
      selectDate: '',
      selectType: '',
      addModal: false,
      // 剩余金额
      remainAmount: 0,
      // 当日消费
      dayConsumptionAmount: 0,
      loading: false,
      // 初始化信息总条数
      dataCount: 0,
      // 每页显示多少条
      pageSize: 10,
      // 当前页
      pageNum: 1,
      titleColumns: [
        {
          title: '序号',
          render: (h, params) => {
            return h("span", {
              style: {
                marginRight: '5px',
                fontSize: '18px'
              }
            }, params.index + (this.pageNum - 1) * this.pageSize + 1);
          },
          align: 'center',
          resizable: true,
          width: 70
        },
        {
          title: '日期',
          key: 'date',
          align: 'center',
          resizable: true
        },
        {
          title: '消费类型',
          key: 'convertName',
          align: 'center',
          resizable: true
        },
        {
          title: '消费金额',
          key: 'consumptionAmount',
          align: 'center',
          resizable: true
        },
        {
          title: '详细备注',
          key: 'content',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  ghost: 'true'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.show(params.index)
                  }
                }
              }, '查看备注')
            ]);
          },
          resizable: true
        },
        // {
        //   title: '修改信息',
        //   key: 'update_action',
        //   width: 130,
        //   align: 'center',
        //   render: (h, params) => {
        //     return h('div', [
        //       h('Button', {
        //         props: {
        //           type: 'error',
        //           size: 'small',
        //           ghost: 'true'
        //         },
        //         on: {
        //           click: () => {
        //             this.update(params.index)
        //           }
        //         }
        //       }, '修改信息')
        //     ]);
        //   }
        // },
        {
          title: '删除',
          key: 'delete_action',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small',
                  ghost: 'true'
                },
                on: {
                  click: () => {
                    let msg = "您真的确定要删除吗？";
                    if (confirm(msg) === true) {
                      // 请求删除接口
                      this.delete(params.index)
                      // 重新获取数据
                    }
                  }
                }
              }, '删除')
            ]);
          },
          resizable: true
        }
      ],
      // 当前页的数据
      pageData: [],
      // 新增的表单
      addForm: {
        incomeExpenditure: false,
        date: '',
        // 这里由后台进行转换
        type: '',
        consumptionAmount: '',
        content: ''
      },
      // 新增规则
      addRules: {}
    }
  },
  methods: {
    async getData(index, pageSize) {
      let params = new URLSearchParams();
      index = index === null ? this.pageNum : index;
      pageSize = pageSize === null ? this.pageSize : pageSize
      params.append('pageIndex', index)
      params.append('pageSize', pageSize)
      params.append('userId', this.cookie.getCookie("userId"))
      if (this.selectDate !== '' && this.selectDate !== undefined) {
        params.append('date', this.selectDate)
        console.log(this.selectDate)
      }
      if (this.selectType !== '' && this.selectType !== undefined) {
        let type = this.typeDict.filter(s => {
          return s.convertName === this.selectType
        }).map(s => s.rowId)[0];
        params.append("type", type)
      }
      await axios.post('/financial/list', params)
          .then(res => {
            this.pageData = res.data.data.list
            this.dataCount = res.data.total
            this.dayConsumptionAmount = res.data.data.consumptionAmount
            this.pageData.forEach(s => {
              if (s.consumptionAmount > 0) {
                s.consumptionAmount = "+" + s.consumptionAmount
              }
            })
          })
          .catch(err => {
            console.log(err)
          })
    },
    // 请求分页接口
    handleListApproveHistory(index, pageSize) {
      this.getData(index, pageSize)
    },
    // 下一页
    changePage(index) {
      this.pageNum = index;
      this.getData(index, this.pageSize)
    },
    // 每页的数量
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.handleListApproveHistory(this.index, pageSize)
    },
    // 展示信息
    show(index) {
      this.$Modal.info({
        title: '备注信息',
        content: `${this.pageData[index].content}`
      })
    },
    // 删除
    async delete(index) {
      let params = new URLSearchParams();
      params.append('id', this.pageData[index].id)
      await axios.post('/financial/remove', params)
          .then(res => {
            if (res.data.status === 'success') {
              alert(res.data.data)
              this.refresh()
            } else {
              this.$Message['error']({
                background: true,
                content: res.data.message
              });
            }
          })
          .catch(err => {
            this.$Message['error']({
              background: true,
              content: '网络错误'
            });
            console.log(err)
          })
    },
    // 剩余金额
    async getRemain() {
      let params = new URLSearchParams();
      let userId = this.cookie.getCookie("userId")
      params.append('userId', userId)
      await axios.post('/financial/getRemainById', params)
          .then(res => {
            if (res.data.status === 'success') {
              this.remainAmount = res.data.data
            }
          })
          .catch(err => {
                this.$Message['error']({
                  background: true,
                  content: '剩余金额获取失败'
                });
                console.log(err)
              }
          )
    },
    // 获取表单选择框数据
    addCommand() {
      // await this.getType()
      // modal改为true
      this.addModal = true
    },
    // 获取消费类型
    async getType() {
      let params = new URLSearchParams();
      params.append('tableName', 'FINANCIAL')
      await axios.post('/sysDict/listRowName', params)
          .then(res => {
            if (res.data.status === 'success') {
              this.typeDict = res.data.data
              this.addForm.type = this.typeDict[0].convertName
            }
          })
          .catch(err => {
            this.$Message['error']({
              background: true,
              content: '消费类型获取失败'
            });
            console.log(err)
          })
    },
    // 提交信息
    async addOk() {
      // 消费类型转换
      let type = this.typeDict.filter(s => {
        return s.convertName === this.addForm.type
      }).map(s => s.rowId)[0];
      // 获取用户id
      let userId = this.cookie.getCookie("userId")
      // 收入支付判断
      if(!this.addForm.incomeExpenditure){
        this.addForm.consumptionAmount *= -1
      }
      let params = new URLSearchParams();
      params.append('date', this.addForm.date)
      params.append('consumptionAmount', this.addForm.consumptionAmount)
      params.append('content', this.addForm.content)
      params.append('type', type);
      params.append('userId', userId)
      await axios.post('/financial/save', params)
          .then(res => {
            if (res.data.status === 'success') {
              this.$Message['success']({
                background: true,
                content: '表单提交成功'
              });
              console.log(res)
            }
          }).catch(err => {
            this.$Message['error']({
              background: true,
              content: '表单提交失败'
            });
            console.log(err)
          })
      this.addModal = false;
      this.refresh()
    },
    addCancel() {
      this.addModal = false;
    },
    // 表单操作后刷新
    refresh() {
      this.handleListApproveHistory(this.pageNum, this.pageSize)
      this.getRemain()
    },
    changeIncome(event){
      console.log(event)
    }
  },
  created() {
    this.handleListApproveHistory(1, this.pageSize);
    this.getRemain()
    this.getType()
  },
  mounted() {
  }
}
</script>
