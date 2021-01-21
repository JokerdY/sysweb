<template>
  <div class="home">
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
          <Switch true-color="#13ce66" false-color="#ff4949"/>
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
    <modify-modal :modifyModal="modifyModal"
                  :modifyList="modifyForm"
                  :typeDict="typeDict"
                  @refresh="refresh"/>
    <div class="first-wrap">
      <Button icon="md-add" type="primary" ghost @click="addCommand">新增</Button>
      <div style="position: absolute;right: 0;display: flex">
        <div style="margin-right: 20px">
          <div v-if="date.dateType==='0'">
            <DatePicker type="date"
                        show-week-numbers
                        placeholder="选择查询日期"
                        format="yyyy-MM-dd"
                        value="yyyy-MM-dd"
                        style="width: 200px"
                        @on-change="date.start = $event"
                        @on-ok="getData(1,null)"
                        @on-clear="dateClear()"
                        @on-clickoutside="getData(1,null)"
                        confirm
            />
          </div>
          <div v-else-if="date.dateType==='1'">
            <DatePicker type="year"
                        placeholder="默认查询今年记录"
                        @on-change="date.start = $event"
                        @on-ok="getData(1,null)"
                        @on-clear="dateClear()"
                        @on-clickoutside="getData(1,null)"
                        confirm
            />
          </div>
          <div v-else-if="date.dateType==='2'">
            <DatePicker type="month"
                        placeholder="默认查询本月记录"
                        style="width: 200px"
                        @on-change="date.start = $event"
                        @on-ok="getData(1,null)"
                        @on-clear="dateClear()"
                        @on-clickoutside="getData(1,null)"
                        confirm
            />
          </div>
          <div v-else-if="date.dateType==='3'">
            <DatePicker type="daterange"
                        split-panels
                        show-week-numbers
                        placeholder="默认查询当天记录"
                        style="width: 200px"
                        @on-change="date.start = $event"
                        @on-ok="getDataRange()"
                        @on-clear="dateClear()"
                        @on-clickoutside="getDataRange()"
                        confirm
            />
          </div>
        </div>
        <Select clearable
                style="width:150px;"
                v-model="selectType"
                placeholder="选择消费类型"
                @on-change="getData(1,null)"
                @on-clear="getData(1,null)">
          <Option v-for="item in typeDict" :value="item.convertName" :key="item.rowId">
            {{ item.convertName }}
          </Option>
        </Select>
      </div>
    </div>
    <div class="second-wrap">
      <RadioGroup v-model="date.dateType" type="button" size="small" @on-change="changeRadio($event)">
        <Radio label="0">
          <span>全部</span>
        </Radio>
        <Radio label="1">
          <span>年</span>
        </Radio>
        <Radio label="2">
          <span>月</span>
        </Radio>
        <Radio label="3">
          <span>日</span>
        </Radio>
      </RadioGroup>
      <Button siz="default"
              style="float:right;"
              custom-icon=""
              icon="ios-download-outline"
              type="primary"
              shape="circle"
              v-on:click="exportButton()"
              ghost>导出
      </Button>
    </div>
    <div class="table-wrap">
      <Table border :loading="loading" :columns="titleColumns" :data="pageData"></Table>
      <div><span class="label">{{ this.$root.userName }}的当前可用余额为：{{ this.remainAmount }}元</span></div>
      <div><span class="label">
      <span v-if="date.dateType==='0'">共计</span>
      <span v-else-if="date.dateType==='1'">今年</span>
      <span v-else-if="date.dateType==='2'">本月</span>
      <span v-else-if="date.dateType==='3'">当前</span>
      <span v-if="this.dayConsumptionAmount>0">消费：{{ this.dayConsumptionAmount }}</span>
      <span v-else>盈余：{{ this.dayConsumptionAmount * -1 }}</span>
      元</span></div>
    </div>
    <div class="page-wrap">
      <Page :total="dataCount" :page-size="pageSize" show-total show-elevator class="paging"
            @on-change="changePage"
            @on-page-size-change="changePageSize"></Page>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import modifyModal from "@/components/modal/modifyModal";

export default {
  name: 'Home',
  components: {modifyModal},
  data() {
    return {
      // 消费类型
      typeDict: [{convertName: '', rowId: ''}],
      // 筛选日期
      date: {
        // 日期类型
        dateType: '0',
        start: '',
        end: ''
      },
      selectType: '',
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
                fontSize: '17px'
              }
            }, params.index + (this.pageNum - 1) * this.pageSize + 1);
          },
          align: 'center',
          resizable: true,
        },
        {
          title: '日期',
          key: 'date',
          width: 230,
          align: 'center',
          resizable: true
        },
        {
          title: '消费类型',
          key: 'convertName',
          width: 150,
          align: 'center',
          resizable: true
        },
        {
          title: '消费金额',
          key: 'consumptionAmount',
          align: 'center',
          width: 150,
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
        {
          title: '删改操作',
          key: 'modify_delete_action',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'warning',
                  size: 'small',
                  ghost: 'true'
                },
                style: {
                  marginRight: '10px'
                },
                on: {
                  click: () => {
                    this.modify(params.index)
                  }
                }
              }, '修改'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small',
                  ghost: 'true'
                },
                on: {
                  click: () => {
                    this.delete(params.index)
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
      // 修改表单
      modifyForm: {
        id: '',
        incomeExpenditure: false,
        date: '',
        type: '',
        consumptionAmount: '',
        content: ''
      },
      // 新增的表单
      addForm: {
        incomeExpenditure: false,
        date: '',
        type: '',
        consumptionAmount: '',
        content: ''
      },
      // 新增规则
      addRules: {},
      exportFrom: {
        date: ''
      },
      addModal: false,
      modifyModal: false,
      exportModal: false
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
      params.append('dateType', this.date.dateType)
      if (this.date.start !== '' && this.date.start !== undefined) {
        params.append('startDate', this.date.start)
        console.log(this.date.start)
      }
      if (this.date.end !== '' && this.date.end !== undefined) {
        params.append('endDate', this.date.end)
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
                s.consumptionAmount = '+' + s.consumptionAmount
                s.cellClassName = {consumptionAmount: 'income-amount'}
              } else {
                s.cellClassName = {consumptionAmount: 'expenditure-amount'}
              }
            })
          })
          .catch(err => {
            console.log(err)
          })
    },
    getDataRange() {
      if (this.date.start instanceof Array && this.date.start[0] !== this.date.start[1]) {
        this.date.end = this.date.start[1]
        this.date.start = this.date.start[0]
      }
      this.getData(1, null)
    },
    dateClear() {
      this.date.start = ''
      this.date.end = ''
      this.getData(1, null)
    },
    changeRadio(label) {
      let date = new Date()
      if (label === '0') {
        this.date.start = ''
      } else if (label === '1') {
        this.date.start = date.getFullYear().toString()
      } else if (label === '2') {
        this.date.start = date.getFullYear().toString() + "-" + (date.getMonth() < 9 ? (date.getMonth() + 1).toString() : "0" + (date.getMonth() + 1))
      } else if (label === '3') {
        this.date.start = date.toLocaleDateString().replaceAll("/", "-")
      }
      this.getData(1, null)
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
      let msg = "您真的确定要删除吗？";
      this.$Modal.confirm({
        title: '删除',
        content: msg,
        onOk: async () => {
          let params = new URLSearchParams();
          params.append('id', this.pageData[index].id)
          await axios.post('/financial/remove', params)
              .then(res => {
                if (res.data.status === 'success') {
                  this.$Message['success']({
                    background: true,
                    content: res.data.message
                  });
                  this.refresh()
                } else {
                  this.$Message['warning']({
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
        }
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
      if (!this.addForm.incomeExpenditure) {
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
      this.addCancel()
      this.refresh()
    },
    addCancel() {
      this.addModal = false;
      this.addForm.consumptionAmount = ''
      this.addForm.content = ''
    },
    // 修改信息
    modify(index) {
      // 消费类型转换
      let convertName = this.typeDict.filter(s => {
        return Number(s.rowId) === this.pageData[index].type
      }).map(s => s.convertName)[0];
      this.modifyModal = true
      this.modifyForm.consumptionAmount = (this.pageData[index].consumptionAmount + "").substring(1)
      this.modifyForm.type = convertName
      this.modifyForm.content = this.pageData[index].content
      this.modifyForm.date = this.pageData[index].date
      this.modifyForm.incomeExpenditure = this.pageData[index].consumptionAmount > 0
      this.modifyForm.id = this.pageData[index].id
    },
    // 表单操作后刷新
    refresh() {
      this.handleListApproveHistory(this.pageNum, this.pageSize)
      this.getRemain()
    },
    exportButton() {
      let params = new URLSearchParams();
      params.append('userId', this.cookie.getCookie("userId"))
      params.append('dateType', this.date.dateType)
      if (this.date.start !== '' && this.date.start !== undefined) {
        params.append('startDate', this.date.start)
      }
      if (this.date.end !== '' && this.date.end !== undefined) {
        params.append('endDate', this.date.end)
      }
      if (this.selectType !== '' && this.selectType !== undefined) {
        let type = this.typeDict.filter(s => {
          return s.convertName === this.selectType
        }).map(s => s.rowId)[0];
        params.append("type", type)
      }
      axios({
        method: 'post',// 设置请求方式
        url: `/financial/exportExcel`,// 设置请求地址
        data: params,
        responseType: 'blob'
      }).then(res => {
        let blob = new Blob([res.data], {type: 'application/vnd.ms-excel'})
        let fileName = decodeURI(res.headers['content-disposition']);// 设置文件名称,decodeURI：可以对后端使用encodeURI() 函数编码过的 URI 进行解码。encodeURI() 是后端为了解决中文乱码问题
        if (fileName) {// 根据后端返回的数据处理文件名称
          fileName = fileName.substring(fileName.indexOf('=') + 1);
        }
        let url = window.URL.createObjectURL(blob)
        const link = document.createElement('a') // 创建a标签
        link.href = url
        link.download = fileName // 重命名文件
        link.style.display = 'none';
        document.body.appendChild(link);// 将a标签添加到body中
        link.click();// 执行a标签的点击方法
        URL.revokeObjectURL(link.href) // 下载完成释放URL 对象
        document.body.removeChild(link)// 移除a标签
      }).catch(err => {
        console.log(err)
      })
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

<style lang="less" scoped>
.home {
  display: flex;
  flex-flow: column;
  justify-content: center;
  position: relative;

  .first-wrap {
    position: relative;
    display: flex;
  }

  .second-wrap {
    margin-top: 20px;
    position: relative;
  }

  .table-wrap {
    margin-top: 20px;
  }

  .page-wrap {
    text-align: center;
  }
}
</style>