// https://github.com/selfrefactor/rambda
export function type(input) {
  if (input === null) {
    return 'Null'
  } else if (input === undefined) {
    return 'Undefined'
  } else if (Number.isNaN(input)) {
    return 'NaN'
  }
  const typeResult = Object.prototype.toString.call(input).slice(8, -1)

  return typeResult === 'AsyncFunction' ? 'Async' : typeResult
}

export function is(targetPrototype, x) {
  if (arguments.length === 1) return _x => is(targetPrototype, _x)

  return (
    (x != null && x.constructor === targetPrototype) ||
    x instanceof targetPrototype
  )
}

export function isEmpty(input) {
  const inputType = type(input)
  if (['Undefined', 'NaN', 'Number', 'Null'].includes(inputType))
    return false
  if (!input) return true

  if (inputType === 'Object') {
    return Object.keys(input).length === 0
  }

  if (inputType === 'Array') {
    return input.length === 0
  }

  return false
}

export function isFunction(fn) {
  return ['Async', 'Function'].includes(type(fn))
}

export function isNil(x) {
  return x === undefined || x === null
}

export function isPromise(x) {
  return ['Async', 'Promise'].includes(type(x))
}

export const isNilOrEmpty = (x) => {
  return isNil(x) || isEmpty(x) || Number.isNaN(x)
}

export const isNotNilOrEmpty = (x) => {
  return !isNilOrEmpty(x)
}

export function has(obj, prop) {
  if (arguments.length === 1) return _obj => has(obj, _obj)
  if (!prop) return false
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

export const { isArray } = Array

export function clone(input) {
  const out = isArray(input) ? Array(input.length) : {}
  if (input && input.getTime) return new Date(input.getTime())

  for (const key in input) {
    const v = input[key]
    out[key] =
      typeof v === 'object' && v !== null
        ? v.getTime
          ? new Date(v.getTime())
          : clone(v)
        : v
  }

  return out
}

function includesWith(
  predicate, target, list,
) {
  let willReturn = false
  let index = -1

  while (++index < list.length && !willReturn) {
    const value = list[index]

    if (predicate(target, value)) {
      willReturn = true
    }
  }

  return willReturn
}

export function uniqWith(predicate, list) {
  if (isNilOrEmpty(list)) { return }
  if (arguments.length === 1) return _list => uniqWith(predicate, _list)

  let index = -1
  const willReturn = []

  while (++index < list.length) {
    const value = list[index]

    if (!includesWith(
      predicate, value, willReturn,
    )) {
      willReturn.push(value)
    }
  }

  return willReturn
}

export function uniqBy(list, field) {
  const fn = (x, y) => x[field] === y[field]
  return uniqWith(fn, list)
}

export function uniq(list) {
  return Array.from(new Set(list))
}

export function _lastIndexOf(valueToFind, list) {
  if (!isArray(list)) {
    throw new Error(`Cannot read property 'indexOf' of ${list}`)
  }
  const typeOfValue = type(valueToFind)
  if (!['Object', 'Array', 'NaN', 'RegExp'].includes(typeOfValue))
    return list.lastIndexOf(valueToFind)

  const { length } = list
  let index = length
  let foundIndex = -1

  while (--index > -1 && foundIndex === -1) {
    if (equals(list[index], valueToFind)) {
      foundIndex = index
    }
  }

  return foundIndex
}

export function _indexOf(valueToFind, list) {
  if (!isArray(list)) {
    throw new Error(`Cannot read property 'indexOf' of ${list}`)
  }
  const typeOfValue = type(valueToFind)
  if (!['Object', 'Array', 'NaN', 'RegExp'].includes(typeOfValue))
    return list.indexOf(valueToFind)

  let index = -1
  let foundIndex = -1
  const { length } = list

  while (++index < length && foundIndex === -1) {
    if (equals(list[index], valueToFind)) {
      foundIndex = index
    }
  }

  return foundIndex
}

function _arrayFromIterator(iter) {
  const list = []
  let next

  while (!(next = iter.next()).done) {
    list.push(next.value)
  }

  return list
}

function _equalsSets(a, b) {
  if (a.size !== b.size) {
    return false
  }
  const aList = _arrayFromIterator(a.values())
  const bList = _arrayFromIterator(b.values())

  const filtered = aList.filter(aInstance => _indexOf(aInstance, bList) === -1)

  return filtered.length === 0
}

function parseError(maybeError) {
  // eslint-disable-next-line no-proto
  const typeofError = maybeError.__proto__.toString()
  if (!['Error', 'TypeError'].includes(typeofError)) return []

  return [typeofError, maybeError.message]
}

function parseDate(maybeDate) {
  if (!maybeDate.toDateString) return [false]

  return [true, maybeDate.getTime()]
}

function parseRegex(maybeRegex) {
  if (maybeRegex.constructor !== RegExp) return [false]

  return [true, maybeRegex.toString()]
}

function equalsSets(a, b) {
  if (a.size !== b.size) {
    return false
  }
  const aList = _arrayFromIterator(a.values())
  const bList = _arrayFromIterator(b.values())

  const filtered = aList.filter(aInstance => _indexOf(aInstance, bList) === -1)

  return filtered.length === 0
}

export function equals(a, b) {
  if (arguments.length === 1) return _b => equals(a, _b)

  const aType = type(a)

  if (aType !== type(b)) return false
  if (aType === 'Function') {
    return a.name === undefined ? false : a.name === b.name
  }

  if (['NaN', 'Undefined', 'Null'].includes(aType)) return true

  if (aType === 'Number') {
    if (Object.is(-0, a) !== Object.is(-0, b)) return false

    return a.toString() === b.toString()
  }

  if (['String', 'Boolean'].includes(aType)) {
    return a.toString() === b.toString()
  }

  if (aType === 'Array') {
    const aClone = Array.from(a)
    const bClone = Array.from(b)

    if (aClone.toString() !== bClone.toString()) {
      return false
    }

    let loopArrayFlag = true
    aClone.forEach((aCloneInstance, aCloneIndex) => {
      if (loopArrayFlag) {
        if (
          aCloneInstance !== bClone[aCloneIndex] &&
          !equals(aCloneInstance, bClone[aCloneIndex])
        ) {
          loopArrayFlag = false
        }
      }
    })

    return loopArrayFlag
  }

  const aRegex = parseRegex(a)
  const bRegex = parseRegex(b)

  if (aRegex[0]) {
    return bRegex[0] ? aRegex[1] === bRegex[1] : false
  } else if (bRegex[0]) return false

  const aDate = parseDate(a)
  const bDate = parseDate(b)

  if (aDate[0]) {
    return bDate[0] ? aDate[1] === bDate[1] : false
  } else if (bDate[0]) return false

  const aError = parseError(a)
  const bError = parseError(b)

  if (aError[0]) {
    return bError[0]
      ? aError[0] === bError[0] && aError[1] === bError[1]
      : false
  }
  if (aType === 'Set') {
    return _equalsSets(a, b)
  }
  if (aType === 'Object') {
    const aKeys = Object.keys(a)

    if (aKeys.length !== Object.keys(b).length) {
      return false
    }

    let loopObjectFlag = true
    aKeys.forEach(aKeyInstance => {
      if (loopObjectFlag) {
        const aValue = a[aKeyInstance]
        const bValue = b[aKeyInstance]

        if (aValue !== bValue && !equals(aValue, bValue)) {
          loopObjectFlag = false
        }
      }
    })

    return loopObjectFlag
  }

  return false
}

export function sortBy(list, item) {
  return list.sort((a, b) => {
    return a[item] > b[item] ? 1 : -1
  })
}

// 将函数变为可缓存结果的函数
export const cacheStringFunction = (fn) => {
  const cache = Object.create(null)
  return (str) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

// 首字母大写：Capital_case
export const capitalCase = str => str.toLowerCase().replace(/^\S/, s => s.toUpperCase())
// 小驼峰命名法：camelCase；
// 大驼峰命名法：CamelCase 或 PascalCase；
// 小蛇式命名法：snake_case；
// 大蛇式命名法：SNAKE_CASE；
// 烤串式命名法：kebab-case；
// 空格式命名法：space case
export const camelCase = str => str.replace(/[-_](\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
export const PascalCase = str => capitalCase(camelCase(str))
const splitStr = str => str &&
  str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
export const kebabCase = str => splitStr(str).join('-')
export const snakeCase = str => splitStr(str).join('_')
