import RootStack from "./RootStack";
import * as sst from "@serverless-stack/resources";
import { Tags } from 'aws-cdk-lib';

const tags:{[tagName: string]:string} = {
  'ENV': 'DEV',
  'SST': 'true',
  'creator': 'harshit9715@gmail.com',
  'APP': 'contact-app'
}
export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
    timeout: 30,
  });

  const rootStack = new RootStack(app, "my-stack");

  // Add more stacks


  const stackTagger = [rootStack]



  // Add Tag to All resources
  Object.keys(tags).forEach(tag => {
    stackTagger.forEach(stack => {
      Tags.of(stack).add(tag, tags[tag])
    })
  })
  

}
