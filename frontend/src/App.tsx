import { GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import {
  BlogPostCreate,
  BlogPostEdit,
  BlogPostList,
  BlogPostShow,
} from "./pages/blog-posts";
import { VideoList, VideoShow } from "./pages/Main";
import StateProvider from "./contexts/generContext";

function App() {
  return (
    <BrowserRouter>
    <StateProvider>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <Refine
              dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
              notificationProvider={useNotificationProvider}
              routerProvider={routerBindings}
              // resources={[
              //   {
              //     name: "blog_posts",
              //     list: "/blog-posts",
              //     create: "/blog-posts/create",
              //     edit: "/blog-posts/edit/:id",
              //     show: "/blog-posts/show/:id",
              //     meta: {
              //       canDelete: true,
              //     },
              //   },
              //   {
              //     name: "categories",
              //     list: "/categories",
              //     create: "/categories/create",
              //     edit: "/categories/edit/:id",
              //     show: "/categories/show/:id",
              //     meta: {
              //       canDelete: true,
              //     },
              //   },
              // ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                projectId: "S4WR5n-CgKK0D-grujkZ",
              }}
            >
              <Routes>
                <Route
                  element={
                    <ThemedLayoutV2
                      Header={() => <Header sticky />}
                      Sider={(props) => <></>}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  }
                >
                  <Route
                    index
                    element={<NavigateToResource resource="/video" />}
                  />
                  <Route path="/video">
                    <Route index element={<VideoList />} />
                    <Route path="show" element={<VideoShow />} />
                  </Route>
                  {/* <Route path="/blog-posts">
                    <Route index element={<BlogPostList />} />
                    <Route path="create" element={<BlogPostCreate />} />
                    <Route path="edit/:id" element={<BlogPostEdit />} />
                    <Route path="show/:id" element={<BlogPostShow />} />
                  </Route>
                  <Route path="/categories">
                    <Route index element={<CategoryList />} />
                    <Route path="create" element={<CategoryCreate />} />
                    <Route path="edit/:id" element={<CategoryEdit />} />
                    <Route path="show/:id" element={<CategoryShow />} />
                  </Route> */}
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
              </Routes>

              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
      </StateProvider>
    </BrowserRouter>
  );
}

export default App;
