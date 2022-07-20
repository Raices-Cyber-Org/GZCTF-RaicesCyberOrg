import { FC, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, PasswordInput } from '@mantine/core'
import { useInputState, useWindowEvent } from '@mantine/hooks'
import { showNotification } from '@mantine/notifications'
import { mdiCheck, mdiClose } from '@mdi/js'
import { Icon } from '@mdi/react'
import api from '../../Api'
import AccountView from '../../components/AccountView'
import StrengthPasswordInput from '../../components/StrengthPasswordInput'

const Reset: FC = () => {
  const params = useParams()
  const token = params.token
  const email = params.email
  const navigate = useNavigate()
  const [pwd, setPwd] = useInputState('')
  const [retypedPwd, setRetypedPwd] = useInputState('')
  const [disabled, setDisabled] = useState(false)

  const onReset = () => {
    if (pwd !== retypedPwd) {
      showNotification({
        color: 'red',
        title: '请检查输入',
        message: '重复密码有误',
        icon: <Icon path={mdiClose} size={1} />,
      })
      return
    }

    if (!(token && email && typeof token === 'string' && typeof email === 'string')) {
      showNotification({
        color: 'red',
        title: '密码重设失败',
        message: '参数错误，请检查',
        icon: <Icon path={mdiClose} size={1} />,
        disallowClose: true,
      })
      return
    }

    setDisabled(true)
    api.account
      .accountPasswordReset({
        rToken: token,
        email: email,
        password: pwd,
      })
      .then(() => {
        showNotification({
          color: 'teal',
          title: '密码已重置',
          message: '请重新登录',
          icon: <Icon path={mdiCheck} size={1} />,
          disallowClose: true,
        })
        navigate('/account/login')
      })
      .catch((err) => {
        showNotification({
          color: 'red',
          title: '遇到了问题，请稍后重试',
          message: `${err}`,
          icon: <Icon path={mdiClose} size={1} />,
        })
        setDisabled(false)
      })
  }

  useWindowEvent('keydown', (e) => {
    if (e.code == 'Enter' || e.code == 'NumpadEnter') {
      onReset()
    }
  })

  return (
    <AccountView>
      <StrengthPasswordInput
        value={pwd}
        onChange={(event) => setPwd(event.currentTarget.value)}
        label="新密码"
        disabled={disabled}
      />
      <PasswordInput
        required
        value={retypedPwd}
        onChange={(event) => setRetypedPwd(event.currentTarget.value)}
        label="重复密码"
        style={{ width: '100%' }}
        disabled={disabled}
        error={pwd !== retypedPwd}
      />
      <Button fullWidth onClick={onReset} disabled={disabled}>
        重置密码
      </Button>
    </AccountView>
  )
}

export default Reset
