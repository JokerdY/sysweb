<template>
  <div id="login">
    <div class="login_text">
      This’s personal Financial system
    </div>
    <div class="login">
      <Form ref="formItem" :model="formItem">
        <FormItem prop="user">
          <Input type="text" size="large" v-model="formItem.user" placeholder="请输入用户名或者账号" clearable>
            <Icon type="ios-person-outline" slot="prepend"></Icon>
          </Input>
        </FormItem>
        <FormItem prop="password">
          <Input type="password" size="large" v-model="formItem.password" placeholder="请输入密码" clearable>
            <Icon type="ios-lock-outline" slot="prepend"></Icon>
          </Input>
        </FormItem>
        <FormItem>
          <Button type="primary" size="large" long @click="Login('formItem')">登录</Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: "login",
  data() {
    return {
      formItem: {
        user: '',
        password: ''
      },
      ruleInline: {
        user: [
          {required: true, message: '请输入账号', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
        ]
      }
    }
  },
  methods: {
    Login(name) {
      if (this.formItem.user === "" || this.formItem.password === "") {
        this.$Message['warning']({
          background: true,
          content: '请输入完整的登录信息'
        });
        return
      }
      let params = new URLSearchParams();
      params.append('user', this.formItem.user)
      params.append('password', this.formItem.password)
      axios.post('/sysUser/login', params)
          .then(res => {
            if (res.status === 200 && res.data.status === 'success') {
              let loginInfo = {
                userName: res.data.data.nickName,
                userId: res.data.data.id
              }
              this.cookie.setCookie(loginInfo, 1)
              this.$Message['success']({
                background: true,
                content: '登录成功'
              });
              this.$root.isLogin = true
              this.$root.userName = this.cookie.getCookie("userName")
              this.$router.replace('/')
            } else {
              alert(res.data.message)
              // 登录失败清除信息
              this.$refs[name].resetFields();
            }
          })
          .catch(err => {
            console.log(err)
          })
    },
  }
}
</script>

<style scoped>
</style>