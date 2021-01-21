<template>
  <div id="app">
    <Menu mode="horizontal" theme="light" active-name="1">
      <Row>
        <Col span="12">
          <div v-if=!this.$root.isLogin>
            <MenuItem>
              <router-link to="/home">
                <Icon type="ios-home"/>
                <span class="label"> 首页</span>
              </router-link>
            </MenuItem>
          </div>
          <div v-else>
            <MenuItem>
              <router-link to="/home">
                <Icon type="ios-home"/>
                <span class="label"> {{ this.$root.userName }}的财务报表</span>
              </router-link>
            </MenuItem>
          </div>
        </Col>
        <!--        登录 跳login 登录后注销回跳login 登录成功时isLogin=true-->
        <Col span="12">
          <div style="float:right">
            <MenuItem name="2" v-if="userId===''">
              <Icon type="md-person"/>
              登录
            </MenuItem>
            <MenuItem name="2" v-else>
              <div @click="exit">
                <Icon type="ios-backspace-outline"/>
                注销
              </div>
            </MenuItem>
          </div>
        </Col>
      </Row>
    </Menu>
    <div v-if=!this.$root.isLogin>
      <div class="background">
        <img :src="imgSrc" width="100%" height="100%" alt=""/>
      </div>
      <div class="center_css">
        <Login/>
      </div>
    </div>
    <div v-else>
      <div class="form_css">
        <Home/>
      </div>
    </div>
    <div>
    </div>
  </div>
</template>

<style scoped>

</style>
<script>
import Login from '@/components/Login'
import Home from '@/components/Home'

export default {
  data() {
    return {
      imgSrc:require('./assets/login.png')
    }
  },
  methods: {
    exit() {
      this.cookie.clearCookie("userName")
      this.cookie.clearCookie("userId")
      this.$root.isLogin = false
      this.$root.userName = ''
      this.$router.replace("/Login")
    },
    isLogin() {
      return this.cookie.getCookie("userId") !== null
    },
    init() {
      this.$root.isLogin = this.cookie.getCookie("userName") !== null
      this.$root.userName = this.cookie.getCookie("userName")
    }
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    Login,
    Home
  },
  created() {
    this.init()
  }
}
</script>

<style lang="less" scoped>
.form_css {
    min-width: 1000px;
}

.background {
  width: 100%;
  height: 100%; /**宽高100%是为了图片铺满屏幕 */
  z-index: -1;
  position: absolute;
}
</style>