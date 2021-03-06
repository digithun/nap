const request = require('superagent')
const DataLoader = require('dataloader')
const wallet = {
  silver: 1000,
  gold: 10000,
  receipts: []
}

const createConnector = (config, { token, headers }) => {
  if (!config.e_wallet_enabled) {
    return null
  }
  const api = config.e_wallet_api
  if (api === 'DEV') {
    return {
      hasReceipt: async ({ refId, spendType }) => !!wallet.receipts.find(r => r.toString() === refId.toString()),
      getJelly: async () => ({ gold: wallet.gold, silver: wallet.silver }),
      spendJelly: async ({ refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate, payload }) => {
        console.log('Ewallet.DEV.spendJelly: ', { refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate, payload })
        if (currencyType === 'gold') {
          wallet.gold -= amount
        } else {
          wallet.silver -= amount
        }
        wallet.receipts.push(refId)
        return { gold: wallet.gold, silver: wallet.silver }
      }
      // addExchange: async () =>({token, amountIn, amountOut, conversionType, progressBarcode, status})
    }
  } else {
    const callApi = async (path, data = {}, timeout = 5000) => {
      // console.log(chalk.yellow('Ewallet: ') + `External api call ${path}`, data)

      try {
        const result = await request
        .post(`${api}/v1/${path}`)
        .set('Content-Type', 'application/json')
        // add token to data
        .set('x-access-token', process.env.E_WALLET_ACCESS_TOKEN || 'undefined')
        .timeout({
          response: timeout
        })
        .send(Object.assign({
          token,
          requestHeaders: headers
        }, data))

        return result.body.data
      } catch (e) {
        console.log('init ewallet: error on call api')
        console.error(e)
        throw e
      }
    }
    const callGetApi = async (path, data = {}) => {
      const result = await request
        .get(`${api}/v1/${path}`)
        .set('Content-Type', 'application/json')
        // add token to data
        .set('x-access-token', process.env.E_WALLET_ACCESS_TOKEN || 'undefined')
      return result.body.data
    }
    const hasReceipt = new DataLoader(keys => {
      return callApi('spend/hasReceipts', { receipts: keys })
    }, {
      cacheKeyFn: ({ refId, spendType }) => `${spendType}/${refId}`
    })
    return {
      hasReceipt: async ({ refId, spendType }) => {
        if (!token) return false
        try {
          return await hasReceipt.load({ refId, spendType })
        } catch (error) {
          console.error(error)
          return false
        }
      },
      hasCard: async ({ token }) => {
        if (!token) return false
        try {
          const result = await callApi('creditcard/hasCard', { token })
          return result
        } catch(error) {
          console.error(error)
          return false
        }
      },
      deleteCard: async ({ token }) => {
        if (!token) return false
        try {
          const result = await callApi('creditcard/deleteCard', { token })
          return result
        } catch(error) {
          console.error(error)
          return false
        }
      },
      getJelly: async () => {
        if (!token) return { gold: 0, silver: 0 }
        try {
          const result = await callApi('user/getJelly', { token })
          if (result.gold >= 0) { return result }
          return { gold: 0, silver: 0 }
        } catch (e) {
          console.log(e)
          return { gold: 0, silver: 0 }
        }
      },
      getMerchantEwallet: async () => {
        if (!token) return { gold: 0, silver: 0 }
        console.log('getMerchantEwallet')
        try {
          const result = await callApi('user/getMerchantEwallet', { token })
          return result
        } catch (e) {
          return { gold: 0, silver: 0 }
        }
      },
      spendJelly: async ({ refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate, payload }) => {
        if (!token) throw new Error('authentication')
        const result = await callApi('spend/spendJelly', { refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate, payload }, 60000)
        return result
      },
      // TO DO: change schema
      addExchange: async ({ amountIn, amountOut, conversionType }) => {
        if (!token) throw new Error('authentication')
        const result = await callApi('exchange/addExchange', { amountIn, amountOut, conversionType })
        return result
      },
      getRate: async ({ collectionType }) => {
        const rateType = 'baht:gold'
        const result = await callApi('rate/findRateActive', { rateType, collectionType })
        return result
      },
      findExchangeByToken: async ({skip, start, end, type}) => {
        if (!token) return []
        const result = await callApi('exchange/findByToken', { token, skip, start, end, type})
        return result || {}
      },
      findSpendByToken: async ({skip, start, end}) => {
        if (!token) return []
        const result = await callApi('spend/findByToken', { token, skip, start, end })
        return result || {}
      },
      findFeeTax: async () => {
        const result = await callGetApi('config/findConfig')
        return result
      },
      createWithdraw: async ({ due, fee, tax }) => {
        if (!token) throw new Error('authentication')
        const result = await callApi('withdraw/addWithdraw', { token, due, fee, tax })
        return result
      },
      findWithdrawByToken: async () => {
        if (!token) return []
        const result = await callApi('withdraw/findWithdrawByToken', { token })
        return result.withdraws || []
      },
      findIncomeByToken: async ({skip}) => {
        if (!token) return []
        console.log(token, skip)
        const result = await callApi('spend/findIncomeByToken', { token, skip })
        return result || {}
      },
      findIncomeByBook: async ({ bookId, skip, start, end }) => {
        if (!token) return []
        const result = await callApi('spend/findIncomeByBook', { bookId, skip, start, end })
        return result || {}
      },
      addExchangeByTruemoney: async ({ cashcardNO }) => {
        if (!token) return []
        const result = await callApi('exchange/addExchangeByTruemoney', { cashcardNO })
        return result || []
      }
    }
  }
}
module.exports = createConnector
