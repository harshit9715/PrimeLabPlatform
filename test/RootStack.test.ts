import { Template } from "aws-cdk-lib/assertions";
import * as sst from "@serverless-stack/resources";
import RootStack from "../stacks/RootStack";

test("Test Root Stack", () => {
  const app = new sst.App();
  // WHEN
  const stack = new RootStack(app, "test-root-stack");
  // THEN
  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::Lambda::Function", 8);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});
