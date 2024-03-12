import { findTree } from 'xe-utils'
import set from 'set-value'

// 将带 pid 的数组转为树形结构
export const flatToTree = (flatArray, treeOptions) => {
  const options = {
    id: 'id',
    parentId: 'parentId',
    children: 'children',
    ...treeOptions,
  }
  const dictionary = {} // a hash table mapping to the specific array objects with their ids as key
  const tree = []
  const children = options.children
  flatArray.forEach(node => {
    const nodeId = node[options.id]
    const nodeParentId = node[options.parentId]
    // set up current node data in dictionary
    dictionary[nodeId] = {
      [children]: null, // init a children property
      ...node, // add other propertys
      ...dictionary[nodeId], // children will be replaced if this node already has children property which was set below
    }
    dictionary[nodeParentId] = dictionary[nodeParentId] || { [children]: [] } // if it's not exist in dictionary, init an object with children property
    if (dictionary[nodeParentId][children] === null) { dictionary[nodeParentId][children] = [] }
    dictionary[nodeParentId][children].push(dictionary[nodeId]) // add reference to current node object in parent node object
  })
  // find root nodes
  Object.values(dictionary).forEach(obj => {
    if (typeof obj[options.id] === 'undefined') {
      tree.push(...obj[children])
    }
  })
  return tree
}
// 数组扁平化（树状数组转普通数组）
export const treeToFlat = (arr, str = 'children') => {
  if (!isArray(arr)) return []
  return arr.reduce((result, item) => {
    return result.concat(item, (Array.isArray(item[str]) ? treeToFlat(item[str]) : []))
  }, [])
}
// 根据 sort_no 给树排序
export const sortBySortNo = (data) => {
  // 首先对顶层节点进行排序
  data.sort((a, b) => a.sort_no - b.sort_no)
  // 对每个节点的子节点进行排序
  data.forEach(node => {
    if (node.children && node.children.length > 0) {
      node.children = sortBySortNo(node.children)
    }
  })
  return data
}
// 获取树节点路径
export const treeNodePath = (node) => {
  if (isNilOrEmpty(node)) return []
  const path = []
  const getPath = (e) => {
    path.splice(0, 0, e.title || e?.node.title)
    if (e.parent) {
      getPath(e.parent)
    }
  }
  getPath(node)
  return path
}
// 根据默认位置生成排序位
export const aTreeNodeDrop = ({ dragNode, dropPosition, dropToGap, node }, treeData) => {
  // 说明：dropToGap=true 移动到 node 的同级；=false移动到 node 的下级(如果 node 是叶子节点 isLeaf=true，则还是移动到 node 的同级)
  // 步骤 1：确定 dropPid
  // 默认为 dropToGap===true 时的取值
  let dropPid = node.parentId
  let dropIdx = dropPosition === -1 ? 0 : dropPosition // 最顶层为 -1
  if (!dropToGap) {
    if (node.isLeaf) {
      dropIdx = Number(node.pos.split('-').at(-1)) + 1
    } else {
      dropPid = node.id
      dropIdx = 0
    }
  }
  // 步骤 2
  const newTreeData = [...treeData]
  const dragItem = findTree(newTreeData, (e) => e.id === dragNode.id)
  const dragParentChildren = dragNode.parentId
    ? findTree(newTreeData, (e) => e.id === dragNode.parentId).item.children
    : newTreeData
  const dragIdx = dragParentChildren.findIndex((e) => e.id === dragNode.id)
  const dragParentPath = dragItem.path.slice(0, -1) // 拖动前父节点路径
  // 判断是否跨节点拖动
  if (dragNode.parentId === dropPid) { // 节点内拖动
    if (dragIdx < dropIdx) { dropIdx -= 1 }
    if (!dropPid) { // 放置到顶层节点
      newTreeData.splice(dragIdx, 1)
      newTreeData.splice(dropIdx, 0, dragItem.item)
    } else {
      // 放置到父结点
      const dropParentItem = findTree(newTreeData, (e) => e.id === dropPid)
      const dropChildren = dropParentItem.item.children
      dropChildren.splice(dragIdx, 1)
      dropChildren.splice(dropIdx, 0, dragItem.item)
      set(newTreeData, dragParentPath, dropChildren)
    }
  } else { // 跨节点拖动
    if (dragNode.parentId) { // 拖动前所在位置非顶层节点
      const dragParentItem = findTree(newTreeData, (e) => e.id === dragNode.parentId)
      const dragChildren = dragParentItem.item.children
      dragChildren.splice(dragIdx, 1)
      set(newTreeData, dragParentPath, dragChildren)
    } else { // 拖动前所在位置为顶层节点
      newTreeData.splice(dragIdx, 1)
    }
    // 将 dragNode 插入到 dropParent
    if (!dropPid) { // 放置到顶层节点
      newTreeData.splice(dropIdx, 0, dragItem.item)
    } else {
      const dropParentItem = findTree(newTreeData, (e) => e.id === dropPid)
      const dropChildren = dropParentItem.item.children || []
      dropChildren.splice(dropIdx, 0, dragItem.item)
      set(newTreeData, [...dropParentItem.path, 'children'], dropChildren)
    }
  }
  const newSort = treeDataSort(newTreeData)
  const idx = newSort.findIndex(e => e.id === dragNode.id)
  if (idx > -1) {
    newSort[idx].pid = dropPid || 'NULL'
  }
  return newSort
}
// 生成树 sort_no
export const treeDataSort = (treeData) => {
  const newSort = []
  function getSortNo(data, pNo = null) {
    data.forEach((e, idx) => {
      if (pNo) {
        e.sort_no = `${pNo}-${idx.toString()}`
      } else {
        e.sort_no = idx.toString()
      }
      newSort.push({ id: e.id, sort_no: e.sort_no })
    })
    data.forEach(e => {
      if (isNotNilOrEmpty(e.children)) {
        getSortNo(e.children, e.sort_no)
      }
    })
  }
  getSortNo(treeData)
  return newSort
}
// 数列表数据
export const treeDataList = (treeData, options = {}) => {
  const { key, title, pid, leaf } = options
  const keyName = key || 'id'
  const titleName = title || 'title'
  const pidName = pid || 'pid'
  const leafName = leaf || 'is_dir'
  return sortBySortNo(flatToTree(treeData.map(e => {
    return {
      ...e,
      key: e[keyName], parentId: e[pidName], isLeaf: !e[leafName], title: e[titleName],
    }
  })))
}
// 数组型树数据获取所有 pid
export const getAllPids = (flatData, nodeId, pid = 'parentId') => {
  const pids = []
  function getPid(id) {
    const item = flatData.find(e => e.id === id)
    if (isNotNilOrEmpty(item)) {
      if (item.is_dir) { pids.push(item.id) }
      if (isNotNilOrEmpty(item[pid])) {
        getPid(item[pid])
      }
    }
  }
  getPid(nodeId)
  return pids
}
// 获取所有上级 id
export const getMenuPids = (_menuList, menuKeys, pid = 'pid') => {
  if (isNilOrEmpty(_menuList) || isNilOrEmpty(menuKeys)) return []
  let _targetPids = []
  menuKeys.forEach(e => {
    const pids = getAllPids(_menuList, e, pid)
    _targetPids = [..._targetPids, ...menuKeys, ...pids]
  })
  return _targetPids
}
// 树型数据获取所有 parentKey
export const getParentKey = (key, tree) => {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}
