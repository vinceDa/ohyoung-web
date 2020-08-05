/**
 * 下拉选择树需要的数据的key和后台返回的key不同，在这里需要做一道转换
 * @param originData 需要处理的数据
 */
export function handleOriginDataToTreeData(originData: any) {
    originData.forEach((item: any, index: any)=>{
        const single = originData[index];
        item.key = single.id;
        item.value = single.id;
        item.title = single.name;
        // 删除其他多余的key值
        // eslint-disable-next-line no-restricted-syntax
        for(const key in item){
            if (key !== 'key' && key !== 'value' && key !=='title' && key !== 'children') {
                delete item[key];
            }
        }
        if (single.children != null) {
            handleOriginDataToTreeData(single.children);
        }
      });
}

