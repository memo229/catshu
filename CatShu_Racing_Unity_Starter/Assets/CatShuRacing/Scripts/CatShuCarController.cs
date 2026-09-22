using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class CatShuCarController : MonoBehaviour
{
    [Header("Power")]
    public float maxSpeedKmh = 285f;
    public float motorTorque = 1900f;
    public float reverseTorque = 900f;
    public float brakeTorque = 3200f;
    public float handbrakeTorque = 5200f;

    [Header("Steering")]
    public float maxSteerAngle = 31f;
    public float highSpeedSteerLimit = 0.55f;

    [Header("Nitro")]
    public float nitroForce = 8500f;
    public float nitroCapacity = 3f;
    public float nitroRecharge = 0.35f;

    [Header("Wheel setup")]
    public WheelCollider frontLeft;
    public WheelCollider frontRight;
    public WheelCollider rearLeft;
    public WheelCollider rearRight;

    [Header("Visual wheels")]
    public Transform frontLeftVisual;
    public Transform frontRightVisual;
    public Transform rearLeftVisual;
    public Transform rearRightVisual;

    public float SpeedKmh => rb.linearVelocity.magnitude * 3.6f;
    public float Nitro01 => nitroCapacity <= 0 ? 0 : currentNitro / nitroCapacity;

    Rigidbody rb;
    float currentNitro;
    float throttle;
    float steer;
    bool braking;
    bool handbrake;
    bool nitro;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        currentNitro = nitroCapacity;

        rb.mass = 1450f;
        rb.linearDamping = 0.035f;
        rb.angularDamping = 0.6f;
        rb.centerOfMass = new Vector3(0f, -0.38f, 0.05f);
        rb.interpolation = RigidbodyInterpolation.Interpolate;
    }

    void Update()
    {
        throttle = Input.GetAxisRaw("Vertical");
        steer = Input.GetAxisRaw("Horizontal");
        braking = Input.GetKey(KeyCode.S) || Input.GetKey(KeyCode.DownArrow);
        handbrake = Input.GetKey(KeyCode.Space);
        nitro = Input.GetKey(KeyCode.LeftShift) && currentNitro > 0.02f && SpeedKmh > 25f;

        if (Input.GetKeyDown(KeyCode.R))
            ResetCar();

        UpdateWheelVisual(frontLeft, frontLeftVisual);
        UpdateWheelVisual(frontRight, frontRightVisual);
        UpdateWheelVisual(rearLeft, rearLeftVisual);
        UpdateWheelVisual(rearRight, rearRightVisual);
    }

    void FixedUpdate()
    {
        ApplySteering();
        ApplyDrive();
        ApplyBrakes();
        ApplyNitro();
        Stabilize();
    }

    void ApplySteering()
    {
        float speedFactor = Mathf.InverseLerp(0f, maxSpeedKmh, SpeedKmh);
        float steerFactor = Mathf.Lerp(1f, highSpeedSteerLimit, speedFactor);
        float angle = steer * maxSteerAngle * steerFactor;

        frontLeft.steerAngle = angle;
        frontRight.steerAngle = angle;
    }

    void ApplyDrive()
    {
        float forwardSpeed = Vector3.Dot(rb.linearVelocity, transform.forward);
        bool movingForward = forwardSpeed > 0.5f;

        if (throttle > 0f && SpeedKmh < maxSpeedKmh)
        {
            float speed01 = Mathf.Clamp01(SpeedKmh / maxSpeedKmh);
            float torque = Mathf.Lerp(motorTorque, motorTorque * 0.18f, speed01);
            frontLeft.motorTorque = torque;
            frontRight.motorTorque = torque;
            rearLeft.motorTorque = torque;
            rearRight.motorTorque = torque;
        }
        else if (throttle < 0f && !movingForward)
        {
            rearLeft.motorTorque = -reverseTorque;
            rearRight.motorTorque = -reverseTorque;
            frontLeft.motorTorque = -reverseTorque;
            frontRight.motorTorque = -reverseTorque;
        }
        else
        {
            frontLeft.motorTorque = 0;
            frontRight.motorTorque = 0;
            rearLeft.motorTorque = 0;
            rearRight.motorTorque = 0;
        }
    }

    void ApplyBrakes()
    {
        float torque = 0f;

        if (braking && rb.linearVelocity.sqrMagnitude > 1f)
            torque = brakeTorque;

        if (handbrake)
        {
            rearLeft.brakeTorque = handbrakeTorque;
            rearRight.brakeTorque = handbrakeTorque;
        }
        else
        {
            rearLeft.brakeTorque = torque;
            rearRight.brakeTorque = torque;
        }

        frontLeft.brakeTorque = torque;
        frontRight.brakeTorque = torque;
    }

    void ApplyNitro()
    {
        if (nitro)
        {
            rb.AddForce(transform.forward * nitroForce, ForceMode.Force);
            currentNitro -= Time.fixedDeltaTime;
        }
        else
        {
            currentNitro = Mathf.Min(nitroCapacity, currentNitro + nitroRecharge * Time.fixedDeltaTime);
        }
    }

    void Stabilize()
    {
        Vector3 localVelocity = transform.InverseTransformDirection(rb.linearVelocity);
        localVelocity.x *= 0.985f;
        rb.linearVelocity = transform.TransformDirection(localVelocity);

        if (SpeedKmh > maxSpeedKmh * 1.08f)
            rb.linearVelocity = rb.linearVelocity.normalized * (maxSpeedKmh * 1.08f / 3.6f);
    }

    void UpdateWheelVisual(WheelCollider wc, Transform visual)
    {
        if (!wc || !visual) return;
        wc.GetWorldPose(out Vector3 pos, out Quaternion rot);
        visual.position = pos;
        visual.rotation = rot;
    }

    public void ResetCar()
    {
        rb.linearVelocity = Vector3.zero;
        rb.angularVelocity = Vector3.zero;
        transform.SetPositionAndRotation(new Vector3(0f, 1.3f, -25f), Quaternion.identity);
        currentNitro = nitroCapacity;
    }
}
