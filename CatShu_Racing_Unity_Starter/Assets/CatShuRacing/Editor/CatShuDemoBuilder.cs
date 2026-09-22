using UnityEditor;
using UnityEngine;
using UnityEngine.UI;
using System.IO;

public static class CatShuDemoBuilder
{
    [MenuItem("CatShu Racing/Create Driving Demo")]
    public static void CreateDemo()
    {
        ClearScene();

        GameObject root = new GameObject("CatShuDrivingDemo");

        // Ground
        GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Cube);
        ground.name = "Road";
        ground.transform.position = new Vector3(0, -0.35f, 80);
        ground.transform.localScale = new Vector3(18, 0.5f, 240);
        ground.transform.SetParent(root.transform);

        var roadMat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
        roadMat.color = new Color(0.055f, 0.06f, 0.075f);
        ground.GetComponent<Renderer>().sharedMaterial = roadMat;

        // Road strips
        for (int z = -30; z < 200; z += 12)
        {
            GameObject stripe = GameObject.CreatePrimitive(PrimitiveType.Cube);
            stripe.name = "LaneStripe";
            stripe.transform.position = new Vector3(0, -0.06f, z);
            stripe.transform.localScale = new Vector3(0.22f, 0.04f, 5f);
            stripe.transform.SetParent(root.transform);
            var m = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            m.color = Color.white;
            stripe.GetComponent<Renderer>().sharedMaterial = m;
        }

        // Side barriers
        CreateBarrier(root.transform, -9.5f, 80);
        CreateBarrier(root.transform, 9.5f, 80);

        // Ramps
        CreateRamp(root.transform, new Vector3(0, 0, 70));
        CreateRamp(root.transform, new Vector3(-5, 0, 125));

        // Car
        GameObject car = new GameObject("CatShu_Roadster_PLACEHOLDER");
        car.transform.position = new Vector3(0, 1.3f, -25);

        Rigidbody rb = car.AddComponent<Rigidbody>();

        // Body
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Cube);
        body.name = "RoadsterBody";
        body.transform.SetParent(car.transform);
        body.transform.localPosition = new Vector3(0, 0.25f, 0);
        body.transform.localScale = new Vector3(1.9f, 0.55f, 4.0f);
        body.GetComponent<Collider>().enabled = false;
        var bodyMat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
        bodyMat.color = new Color(0.03f, 0.025f, 0.04f);
        body.GetComponent<Renderer>().sharedMaterial = bodyMat;

        // Cockpit
        GameObject cockpit = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cockpit.name = "OpenCockpit";
        cockpit.transform.SetParent(car.transform);
        cockpit.transform.localPosition = new Vector3(0, 0.72f, 0.25f);
        cockpit.transform.localScale = new Vector3(1.15f, 0.3f, 1.55f);
        cockpit.GetComponent<Collider>().enabled = false;
        var cockpitMat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
        cockpitMat.color = new Color(0.7f, 0.02f, 0.32f);
        cockpit.GetComponent<Renderer>().sharedMaterial = cockpitMat;

        // CatShu placeholder head
        GameObject cat = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        cat.name = "CatShu_Driver_PLACEHOLDER";
        cat.transform.SetParent(car.transform);
        cat.transform.localPosition = new Vector3(0, 1.25f, 0.15f);
        cat.transform.localScale = new Vector3(0.62f, 0.72f, 0.62f);
        cat.GetComponent<Collider>().enabled = false;
        var catMat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
        catMat.color = new Color(0.86f, 0.72f, 0.42f);
        cat.GetComponent<Renderer>().sharedMaterial = catMat;

        // Wheels
        WheelCollider fl = CreateWheel(car.transform, "FL", new Vector3(-0.95f, -0.25f, 1.35f));
        WheelCollider fr = CreateWheel(car.transform, "FR", new Vector3(0.95f, -0.25f, 1.35f));
        WheelCollider rl = CreateWheel(car.transform, "RL", new Vector3(-0.95f, -0.25f, -1.35f));
        WheelCollider rr = CreateWheel(car.transform, "RR", new Vector3(0.95f, -0.25f, -1.35f));

        var controller = car.AddComponent<CatShuCarController>();
        controller.frontLeft = fl;
        controller.frontRight = fr;
        controller.rearLeft = rl;
        controller.rearRight = rr;

        // Camera
        GameObject camObj = new GameObject("Main Camera");
        Camera cam = camObj.AddComponent<Camera>();
        camObj.tag = "MainCamera";
        var camFollow = camObj.AddComponent<CatShuCamera>();
        camFollow.target = car.transform;
        camObj.transform.position = new Vector3(0, 4, -32);

        // Light
        GameObject lightObj = new GameObject("Sun");
        Light light = lightObj.AddComponent<Light>();
        light.type = LightType.Directional;
        light.intensity = 1.1f;
        light.transform.rotation = Quaternion.Euler(50, -25, 0);

        // Save scene
        string path = "Assets/CatShuDrivingDemo.unity";
        UnityEditor.SceneManagement.EditorSceneManager.SaveScene(
            UnityEditor.SceneManagement.EditorSceneManager.NewScene(
                UnityEditor.SceneManagement.NewSceneSetup.EmptyScene,
                UnityEditor.SceneManagement.NewSceneMode.Single
            ), path);

        // Rebuild because NewScene reset happened above
        BuildScene(path);

        Debug.Log("CatShu Driving Demo created. Press Play.");
    }

    static void BuildScene(string path)
    {
        // The initial implementation is intentionally minimal.
        // Re-run builder pieces in the active scene.
        GameObject root = new GameObject("CatShuDrivingDemo");
        GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Cube);
        ground.transform.position = new Vector3(0, -0.35f, 80);
        ground.transform.localScale = new Vector3(18, 0.5f, 240);
        ground.transform.SetParent(root.transform);

        var roadMat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
        roadMat.color = new Color(0.055f, 0.06f, 0.075f);
        ground.GetComponent<Renderer>().sharedMaterial = roadMat;

        for (int z = -30; z < 200; z += 12)
        {
            GameObject stripe = GameObject.CreatePrimitive(PrimitiveType.Cube);
            stripe.transform.position = new Vector3(0, -0.06f, z);
            stripe.transform.localScale = new Vector3(0.22f, 0.04f, 5f);
            stripe.transform.SetParent(root.transform);
        }

        CreateBarrier(root.transform, -9.5f, 80);
        CreateBarrier(root.transform, 9.5f, 80);
        CreateRamp(root.transform, new Vector3(0, 0, 70));
        CreateRamp(root.transform, new Vector3(-5, 0, 125));

        GameObject car = new GameObject("CatShu_Roadster_PLACEHOLDER");
        car.transform.position = new Vector3(0, 1.3f, -25);
        Rigidbody rb = car.AddComponent<Rigidbody>();

        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Cube);
        body.transform.SetParent(car.transform);
        body.transform.localPosition = new Vector3(0, 0.25f, 0);
        body.transform.localScale = new Vector3(1.9f, 0.55f, 4f);
        body.GetComponent<Collider>().enabled = false;

        GameObject cockpit = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cockpit.transform.SetParent(car.transform);
        cockpit.transform.localPosition = new Vector3(0, 0.72f, 0.25f);
        cockpit.transform.localScale = new Vector3(1.15f, 0.3f, 1.55f);
        cockpit.GetComponent<Collider>().enabled = false;

        GameObject cat = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        cat.transform.SetParent(car.transform);
        cat.transform.localPosition = new Vector3(0, 1.25f, 0.15f);
        cat.transform.localScale = new Vector3(0.62f, 0.72f, 0.62f);
        cat.GetComponent<Collider>().enabled = false;

        WheelCollider fl = CreateWheel(car.transform, "FL", new Vector3(-0.95f, -0.25f, 1.35f));
        WheelCollider fr = CreateWheel(car.transform, "FR", new Vector3(0.95f, -0.25f, 1.35f));
        WheelCollider rl = CreateWheel(car.transform, "RL", new Vector3(-0.95f, -0.25f, -1.35f));
        WheelCollider rr = CreateWheel(car.transform, "RR", new Vector3(0.95f, -0.25f, -1.35f));

        var controller = car.AddComponent<CatShuCarController>();
        controller.frontLeft = fl;
        controller.frontRight = fr;
        controller.rearLeft = rl;
        controller.rearRight = rr;

        GameObject camObj = new GameObject("Main Camera");
        camObj.tag = "MainCamera";
        camObj.AddComponent<Camera>();
        var camFollow = camObj.AddComponent<CatShuCamera>();
        camFollow.target = car.transform;

        GameObject lightObj = new GameObject("Sun");
        Light light = lightObj.AddComponent<Light>();
        light.type = LightType.Directional;
        light.intensity = 1.1f;
        light.transform.rotation = Quaternion.Euler(50, -25, 0);

        UnityEditor.SceneManagement.EditorSceneManager.SaveScene(
            UnityEditor.SceneManagement.EditorSceneManager.GetActiveScene(), path);
    }

    static WheelCollider CreateWheel(Transform parent, string name, Vector3 localPos)
    {
        GameObject w = new GameObject(name);
        w.transform.SetParent(parent);
        w.transform.localPosition = localPos;
        var wc = w.AddComponent<WheelCollider>();
        wc.radius = 0.36f;
        wc.mass = 22f;
        wc.suspensionDistance = 0.18f;
        JointSpring spring = wc.suspensionSpring;
        spring.spring = 35000f;
        spring.damper = 4500f;
        spring.targetPosition = 0.5f;
        wc.suspensionSpring = spring;
        return wc;
    }

    static void CreateBarrier(Transform parent, float x, float z)
    {
        GameObject b = GameObject.CreatePrimitive(PrimitiveType.Cube);
        b.transform.position = new Vector3(x, 0.55f, z);
        b.transform.localScale = new Vector3(0.45f, 1.1f, 240f);
        b.transform.SetParent(parent);
    }

    static void CreateRamp(Transform parent, Vector3 pos)
    {
        GameObject r = GameObject.CreatePrimitive(PrimitiveType.Cube);
        r.transform.position = pos + new Vector3(0, 0.35f, 0);
        r.transform.localScale = new Vector3(5f, 0.7f, 7f);
        r.transform.rotation = Quaternion.Euler(-8f, 0, 0);
        r.transform.SetParent(parent);
    }

    static void ClearScene()
    {
        var scene = UnityEditor.SceneManagement.EditorSceneManager.NewScene(
            UnityEditor.SceneManagement.NewSceneSetup.EmptyScene,
            UnityEditor.SceneManagement.NewSceneMode.Single);
    }
}
