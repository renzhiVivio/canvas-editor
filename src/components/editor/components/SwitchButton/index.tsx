import React, {memo, useEffect, useRef, useState} from "react";
import {Button} from "antd";
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';

interface SwitchButtonPropsType {
  icon?: React.ReactNode;
  tag: string;
  text: string;
  value: boolean;
  handleChange?: (tag:any,value:any, property?:string, useIcon?:boolean) => void;
  property?: string;
  useIcon?: boolean;
}

const SwitchButton = (props: SwitchButtonPropsType) => {
  const {icon, tag, text, value, handleChange, property, useIcon} = props;

  const resultRef = useRef<boolean>();

  const [result, setResult] = useState<boolean>();

  useEffect(() => {

    if (value === undefined) setResult(false);
    else setResult(value);
  }, [])

  const onClick = () => {
    setResult(!result);
  };

  useEffect(() => {
    if (handleChange && resultRef.current !== undefined){
      if(property)handleChange(tag,result!,property);
      else handleChange(tag,result!);
    }else resultRef.current = result;
  }, [result])

  return (
    <React.Fragment>
      
      <Button icon={icon} size={"middle"} onClick={onClick} type={result ? "primary" : "default"}>
      {!useIcon?text:property==='linethrough'?<StrikethroughSIcon />:<FormatUnderlinedIcon />}
      </Button>
    </React.Fragment>
  );
};

export default memo(SwitchButton);
