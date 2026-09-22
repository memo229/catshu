using UnityEngine;

public class CatShuCamera : MonoBehaviour
{
    public Transform target;
    public float followDistance = 7.2f;
    public float followHeight = 3.0f;
    public float positionSmooth = 7f;
    public float rotationSmooth = 8f;
    public float lookAhead = 5f;
    public float baseFov = 68f;
    public float nitroFov = 82f;

    Camera cam;
    CatShuCarController car;

    void Start()
    {
        cam = GetComponent<Camera>();
        car = target ? target.GetComponent<CatShuCarController>() : null;
    }

    void LateUpdate()
    {
        if (!target) return;

        Vector3 desired = target.position - target.forward * followDistance + Vector3.up * followHeight;
        transform.position = Vector3.Lerp(transform.position, desired, 1f - Mathf.Exp(-positionSmooth * Time.deltaTime));

        Vector3 lookPoint = target.position + target.forward * lookAhead + Vector3.up * 1.1f;
        Quaternion desiredRot = Quaternion.LookRotation(lookPoint - transform.position, Vector3.up);
        transform.rotation = Quaternion.Slerp(transform.rotation, desiredRot, 1f - Mathf.Exp(-rotationSmooth * Time.deltaTime));

        if (cam && car)
        {
            float speed01 = Mathf.InverseLerp(0f, car.maxSpeedKmh, car.SpeedKmh);
            float targetFov = Mathf.Lerp(baseFov, nitroFov, speed01 * 0.65f);
            if (Input.GetKey(KeyCode.LeftShift))
                targetFov = nitroFov;

            cam.fieldOfView = Mathf.Lerp(cam.fieldOfView, targetFov, 5f * Time.deltaTime);
        }
    }
}
